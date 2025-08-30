import { useEffect, useState, useCallback, useRef } from 'react';

interface DeviceData {
  id: number;
  device_id: string;
  device_name?: string;
  faculty_name?: string;
  network_status: string;
  connection_quality: number;
  signal_strength?: number;
  voltage?: number;
  current_amperage?: number;
  power_factor?: number;
  frequency?: number;
  voltage_phase_b?: number;
  voltage_phase_c?: number;
  current_phase_b?: number;
  current_phase_c?: number;
  power_factor_phase_b?: number;
  power_factor_phase_c?: number;
  active_power?: number;
  reactive_power?: number;
  apparent_power?: number;
  active_power_phase_a?: number;
  active_power_phase_b?: number;
  active_power_phase_c?: number;
  device_temperature?: number;
  total_energy?: number;
  daily_energy?: number;
  uptime_hours?: number;
  last_maintenance?: string;
  last_data_received?: string;
  data_collection_count?: number;
  last_error_code?: string;
  last_error_message?: string;
  last_error_time?: string;
  error_count_today?: number;
  created_at: string;
  updated_at: string;
  device_type?: string;
  location?: string;
  installation_date?: string;
  meter_type?: string;
}

interface DeviceStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  facultyCount: number;
  lastUpdated: string;
}

interface SSEEvent {
  type: 'initial' | 'update' | 'device_update' | 'heartbeat';
  data?: DeviceData[] | any;
  timestamp: string;
  connections?: number;
}

interface UseRealtimeDevicesOptions {
  faculty?: string;
  status?: string;
  enableSSE?: boolean;
  refreshInterval?: number;
}

interface UseRealtimeDevicesReturn {
  devices: DeviceData[];
  devicesByFaculty: { [key: string]: DeviceData[] };
  stats: DeviceStats;
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  lastUpdated: string;
  connectionCount: number;
  refresh: () => Promise<void>;
  reconnect: () => void;
}

const facultyKeyMap: { [key: string]: string } = {
  'engineering': 'วิศวกรรมศาสตร์',
  'institution': 'สถาบันเทคโนโลยี', 
  'liberal_arts': 'ศิลปศาสตร์',
  'business_administration': 'บริหารธุรกิจ',
  'architecture': 'สถาปัตยกรรมศาสตร์',
  'industrial_education': 'ครุศาสตร์อุตสาหกรรม'
};

export function useRealtimeDevices(options: UseRealtimeDevicesOptions = {}): UseRealtimeDevicesReturn {
  const {
    faculty = 'all',
    status = 'all',
    enableSSE = true,
    refreshInterval = 10000
  } = options;

  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [devicesByFaculty, setDevicesByFaculty] = useState<{ [key: string]: DeviceData[] }>({});
  const [stats, setStats] = useState<DeviceStats>({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    facultyCount: 0,
    lastUpdated: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [connectionCount, setConnectionCount] = useState<number>(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ฟังก์ชันดึงข้อมูลจาก API
  const fetchDevicesData = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (faculty !== 'all') params.append('faculty', faculty);
      if (status !== 'all') params.append('status', status);

      const response = await fetch(`/api/realtime/devices?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setDevices(result.data.devices);
        
        // แปลงชื่อคณะเป็น key ที่ใช้ใน UI
        const convertedDevicesByFaculty: { [key: string]: DeviceData[] } = {};
        Object.entries(result.data.devicesByFaculty).forEach(([facultyName, devices]) => {
          const facultyKey = Object.entries(facultyKeyMap).find(
            ([_, name]) => name === facultyName
          )?.[0] || facultyName.toLowerCase().replace(/\s+/g, '_');
          
          convertedDevicesByFaculty[facultyKey] = devices as DeviceData[];
        });
        
        setDevicesByFaculty(convertedDevicesByFaculty);
        setStats(result.data.stats);
        setLastUpdated(new Date().toISOString());
        setIsLoading(false);
      } else {
        throw new Error(result.message || 'Failed to fetch devices data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
    }
  }, [faculty, status]);

  // ฟังก์ชันจัดการ SSE events
  const handleSSEEvent = useCallback((event: MessageEvent) => {
    try {
      const eventData: SSEEvent = JSON.parse(event.data);
      
      switch (eventData.type) {
        case 'initial':
        case 'update':
          if (eventData.data && Array.isArray(eventData.data)) {
            setDevices(eventData.data);
            
            // จัดกลุ่มข้อมูลตามคณะ
            const groupedByFaculty: { [key: string]: DeviceData[] } = {};
            eventData.data.forEach((device: DeviceData) => {
              const facultyKey = Object.entries(facultyKeyMap).find(
                ([_, name]) => name === device.faculty_name
              )?.[0] || device.faculty_name?.toLowerCase().replace(/\s+/g, '_') || 'unknown';
              
              if (!groupedByFaculty[facultyKey]) {
                groupedByFaculty[facultyKey] = [];
              }
              groupedByFaculty[facultyKey].push(device);
            });
            
            setDevicesByFaculty(groupedByFaculty);
            
            // คำนวณสถิติ
            const newStats: DeviceStats = {
              totalDevices: eventData.data.length,
              onlineDevices: eventData.data.filter((d: DeviceData) => d.network_status === 'online').length,
              offlineDevices: eventData.data.filter((d: DeviceData) => d.network_status === 'offline').length,
              facultyCount: Object.keys(groupedByFaculty).length,
              lastUpdated: eventData.timestamp
            };
            setStats(newStats);
            setLastUpdated(eventData.timestamp);
          }
          break;
          
        case 'device_update':
          // อัปเดตอุปกรณ์เฉพาะตัว
          if (eventData.data) {
            setDevices(prev => {
              const updated = [...prev];
              const index = updated.findIndex(d => d.device_id === eventData.data.device_id);
              if (index >= 0) {
                updated[index] = { ...updated[index], ...eventData.data };
              }
              return updated;
            });
          }
          break;
          
        case 'heartbeat':
          if (eventData.connections) {
            setConnectionCount(eventData.connections);
          }
          break;
      }
      
      setIsConnected(true);
      setError(null);
    } catch (err) {
      console.error('❌ Error parsing SSE event:', err);
    }
  }, []);

  // ฟังก์ชันเชื่อมต่อ SSE
  const connectSSE = useCallback(() => {
    if (!enableSSE) return;

    console.log('🔄 Attempting to connect to SSE...');
    
    try {
      const eventSource = new EventSource('/api/realtime/sse');
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('message', (event) => {
        console.log('📨 SSE message received:', event.data.substring(0, 100) + '...');
        handleSSEEvent(event);
      });
      
      eventSource.addEventListener('open', () => {
        console.log('✅ SSE connected successfully');
        setIsConnected(true);
        setError(null);
      });

      eventSource.addEventListener('error', (error) => {
        console.error('❌ SSE connection error:', error);
        console.log('SSE readyState:', eventSource.readyState);
        setIsConnected(false);
        setError('SSE connection failed');
        
        // Auto-reconnect after 5 seconds
        setTimeout(() => {
          console.log('🔄 Attempting SSE reconnection...');
          if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
            connectSSE();
          }
        }, 5000);
      });

    } catch (err) {
      console.error('❌ Failed to create SSE connection:', err);
      setError('Failed to create SSE connection');
    }
  }, [enableSSE, handleSSEEvent]);

  // ฟังก์ชัน reconnect
  const reconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
    connectSSE();
  }, [connectSSE]);

  // ฟังก์ชัน refresh manual
  const refresh = useCallback(async () => {
    await fetchDevicesData();
  }, [fetchDevicesData]);

  // เริ่มต้นการเชื่อมต่อ
  useEffect(() => {
    if (enableSSE) {
      connectSSE();
    } else {
      // ถ้าไม่ใช้ SSE ให้ fetch ข้อมูลปกติ
      fetchDevicesData();
      
      // ตั้ง interval สำหรับ refresh
      refreshTimeoutRef.current = setInterval(fetchDevicesData, refreshInterval);
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [enableSSE, connectSSE, fetchDevicesData, refreshInterval]);

  return {
    devices,
    devicesByFaculty,
    stats,
    isLoading,
    isConnected: enableSSE ? isConnected : true,
    error,
    lastUpdated,
    connectionCount,
    refresh,
    reconnect
  };
}
