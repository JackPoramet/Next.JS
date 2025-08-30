'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Wifi, WifiOff, Thermometer, Zap, Activity, Filter } from 'lucide-react';

interface DeviceData {
  device_id: string;
  device_name?: string;
  faculty_name?: string;
  network_status: string;
  voltage?: number;
  current_amperage?: number;
  active_power?: number;
  power_factor?: number;
  frequency?: number;
  device_temperature?: number;
  total_energy?: number;
  daily_energy?: number;
  updated_at: string;
}

interface SSEEvent {
  type: 'initial' | 'update' | 'heartbeat' | 'device_update';
  data?: DeviceData[];
  timestamp: string;
  connections?: number;
}

export default function RealtimeMonitor() {
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [allDevices, setAllDevices] = useState<DeviceData[]>([]); // เก็บข้อมูลทั้งหมด
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all'); // faculty ที่เลือก
  const [availableFaculties, setAvailableFaculties] = useState<string[]>([]); // รายชื่อ faculty ที่มี
  const [isConnected, setIsConnected] = useState(false);
  const [connectionCount, setConnectionCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  // ฟังก์ชันอัปเดตข้อมูลและจัดการ faculty filtering
  const updateDevicesData = (newDevices: DeviceData[]) => {
    setAllDevices(newDevices);
    
    // อัปเดตรายชื่อ faculty ที่มีอยู่
    const faculties = [...new Set(newDevices.map(d => d.faculty_name).filter(Boolean))] as string[];
    setAvailableFaculties(faculties);
    
    // กรองข้อมูลตาม faculty ที่เลือก
    if (selectedFaculty === 'all') {
      setDevices(newDevices);
    } else {
      setDevices(newDevices.filter(d => d.faculty_name === selectedFaculty));
    }
  };

  // ฟังก์ชันเปลี่ยน faculty filter
  const handleFacultyChange = (faculty: string) => {
    setSelectedFaculty(faculty);
    
    if (faculty === 'all') {
      setDevices(allDevices);
    } else {
      setDevices(allDevices.filter(d => d.faculty_name === faculty));
    }
  };

  // ฟังก์ชันเชื่อมต่อ SSE
  const connectSSE = () => {
    // ป้องกันการ connect ซ้ำ
    if (eventSourceRef.current && eventSourceRef.current.readyState === EventSource.OPEN) {
      console.log('⚠️ SSE already connected');
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    console.log('🔄 Connecting to SSE...');
    setIsLoading(true);
    setError('');

    try {
      const eventSource = new EventSource('/api/realtime/sse');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('✅ SSE Connected');
        setIsConnected(true);
        setError('');
        setIsLoading(false);
        setHasInitialized(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          console.log('📨 SSE Message:', data.type, data);

          switch (data.type) {
            case 'initial':
            case 'update':
              if (data.data && Array.isArray(data.data)) {
                updateDevicesData(data.data);
                setLastUpdated(data.timestamp);
                setIsLoading(false);
              }
              break;
            
            case 'heartbeat':
              if (data.connections) {
                setConnectionCount(data.connections);
              }
              console.log('💓 Heartbeat received');
              break;

            case 'device_update':
              // อัปเดตอุปกรณ์เฉพาะตัว
              if (data.data && Array.isArray(data.data) && data.data.length === 1) {
                const updatedDevice = data.data[0];
                const newAllDevices = [...allDevices];
                const index = newAllDevices.findIndex(d => d.device_id === updatedDevice.device_id);
                
                if (index >= 0) {
                  newAllDevices[index] = { ...newAllDevices[index], ...updatedDevice };
                } else {
                  newAllDevices.push(updatedDevice);
                }
                
                updateDevicesData(newAllDevices);
                setLastUpdated(data.timestamp);
              }
              break;
          }
        } catch (err) {
          console.error('❌ Error parsing SSE data:', err);
          setError('Error parsing SSE data');
        }
      };

      eventSource.onerror = (event) => {
        console.error('❌ SSE Error:', event);
        setIsConnected(false);
        setError('SSE connection error');
        setIsLoading(false);

        // Auto-reconnect after 5 seconds
        setTimeout(() => {
          if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
            console.log('🔄 Auto-reconnecting...');
            connectSSE();
          }
        }, 5000);
      };

    } catch (err) {
      console.error('❌ Failed to create SSE connection:', err);
      setError('Failed to create SSE connection');
      setIsLoading(false);
    }
  };

  // ฟังก์ชันตัดการเชื่อมต่อ
  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
    console.log('🔌 Disconnected');
  };

  // ฟังก์ชัน refresh manual
  const refresh = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/realtime/devices');
      const result = await response.json();

      if (result.success && result.data.devices) {
        updateDevicesData(result.data.devices);
        setLastUpdated(new Date().toISOString());
      } else {
        throw new Error(result.message || 'Failed to fetch devices');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันจัดรูปแบบค่า
  const formatValue = (value: number | string | null | undefined, unit: string = '') => {
    if (value === null || value === undefined) return 'N/A';
    
    // แปลงเป็น number ถ้าเป็น string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // ตรวจสอบว่าเป็น number ที่ valid หรือไม่
    if (typeof numValue !== 'number' || isNaN(numValue)) {
      return 'N/A';
    }
    
    return `${numValue.toFixed(2)} ${unit}`;
  };

  // ฟังก์ชันเลือกสีตามสถานะ
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // เริ่มต้นการเชื่อมต่อ
  useEffect(() => {
    // เชื่อมต่อเฉพาะครั้งแรกเท่านั้น
    if (!hasInitialized) {
      connectSSE();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [hasInitialized]); // dependency เปลี่ยนจาก [] เป็น [hasInitialized]

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            📡 Real-time Monitor
          </h1>
          <p className="text-gray-600 mt-1">
            ข้อมูลอุปกรณ์ IoT แบบเรียลไทม์จาก devices_data table
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Faculty Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select 
              value={selectedFaculty} 
              onChange={(e) => handleFacultyChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-800"
            >
              <option value="all">ทั้งหมด ({allDevices.length})</option>
              {availableFaculties.map(faculty => {
                const count = allDevices.filter(d => d.faculty_name === faculty).length;
                return (
                  <option key={faculty} value={faculty}>
                    {faculty} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <Badge variant={isConnected ? 'success' : 'error'}>
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 mr-1" />
                Connected
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 mr-1" />
                Disconnected
              </>
            )}
          </Badge>
          
          <Button
            onClick={refresh}
            disabled={isLoading}
            variant="outline"
            className="bg-white hover:bg-gray-100"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="bg-white border-b border-gray-100">
          <CardTitle className="text-lg text-gray-800">🔗 Connection Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="font-semibold">Status: </span>
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="font-semibold">Active Connections: </span>
              <span className="text-blue-600">{connectionCount}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="font-semibold">Total Devices: </span>
              <span className="text-purple-600">{allDevices.length}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="font-semibold">Showing: </span>
              <span className="text-blue-600">
                {selectedFaculty === 'all' ? 'ทั้งหมด' : selectedFaculty} ({devices.length})
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="font-semibold">Last Updated: </span>
              <span className="text-gray-600">
                {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              ❌ {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="border border-gray-200">
          <CardContent className="flex items-center justify-center py-12 bg-white">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mr-3" />
            <span className="text-lg text-gray-700">Loading devices data...</span>
          </CardContent>
        </Card>
      )}

      {/* Devices Grid */}
      {!isLoading && devices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {devices.map((device) => (
      <Card key={device.device_id} className="relative border border-gray-200 hover:shadow-md transition-all">
        <CardHeader className="pb-3 bg-white border-b border-gray-100">
                <div className="flex items-center justify-between">
          <CardTitle className="text-lg truncate text-gray-800">
                    🏭 {device.device_name || device.device_id}
                  </CardTitle>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(device.network_status)}`} />
                </div>
        <p className="text-sm text-gray-600">
                  {device.faculty_name || 'Unknown Faculty'}
                </p>
              </CardHeader>
              
        <CardContent className="space-y-4 bg-white">
                {/* Status */}
                <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Status:</span>
                  <Badge variant={device.network_status === 'online' ? 'success' : 'error'}>
                    {device.network_status}
                  </Badge>
                </div>

                {/* Electrical Data */}
                <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Zap className="w-4 h-4 text-yellow-500 mr-1" />
                    <div>
            <div className="font-medium text-gray-700">Voltage</div>
            <div className="text-gray-600">{formatValue(device.voltage, 'V')}</div>
                    </div>
                  </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Activity className="w-4 h-4 text-blue-500 mr-1" />
                    <div>
            <div className="font-medium text-gray-700">Current</div>
            <div className="text-gray-600">{formatValue(device.current_amperage, 'A')}</div>
                    </div>
                  </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Zap className="w-4 h-4 text-green-500 mr-1" />
                    <div>
            <div className="font-medium text-gray-700">Power</div>
            <div className="text-gray-600">{formatValue(device.active_power, 'W')}</div>
                    </div>
                  </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Thermometer className="w-4 h-4 text-red-500 mr-1" />
                    <div>
            <div className="font-medium text-gray-700">Temp</div>
            <div className="text-gray-600">{formatValue(device.device_temperature, '°C')}</div>
                    </div>
                  </div>
                </div>

        {/* Additional Info */}
        <div className="pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
                    <div>Device ID: {device.device_id}</div>
                    <div>Frequency: {formatValue(device.frequency, 'Hz')}</div>
                    <div>Power Factor: {formatValue(device.power_factor)}</div>
                    <div>
                      Updated: {new Date(device.updated_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Devices State */}
      {!isLoading && devices.length === 0 && allDevices.length > 0 && (
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12 bg-white">
            <Filter className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ไม่พบอุปกรณ์ใน {selectedFaculty}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              คณะ {selectedFaculty} ไม่มีอุปกรณ์ IoT ในระบบ
            </p>
            <Button onClick={() => handleFacultyChange('all')} variant="outline" className="bg-white">
              <Filter className="w-4 h-4 mr-2" />
              แสดงทั้งหมด
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Devices State - All */}
      {!isLoading && allDevices.length === 0 && (
        <Card className="border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12 bg-white">
            <Wifi className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No devices found
            </h3>
            <p className="text-gray-600 text-center">
              ไม่พบอุปกรณ์ IoT ในระบบ หรืออาจจะมีปัญหาการเชื่อมต่อ
            </p>
            <Button onClick={refresh} className="mt-4 bg-white" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Connection Controls */}
      <Card className="border border-gray-200 transition-all hover:shadow-md">
        <CardHeader className="bg-white border-b border-gray-100">
          <CardTitle className="text-lg text-gray-800">🔧 Connection Controls</CardTitle>
        </CardHeader>
        <CardContent className="bg-white p-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={connectSSE}
              disabled={isConnected}
              variant="primary"
              className="flex-1 sm:flex-none min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Wifi className="w-4 h-4 mr-2" />
              <span>Connect SSE</span>
            </Button>
            
            <Button
              onClick={disconnect}
              disabled={!isConnected}
              variant="outline"
              className="flex-1 sm:flex-none min-w-[120px] bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <WifiOff className="w-4 h-4 mr-2" />
              <span>Disconnect</span>
            </Button>
            
            <Button
              onClick={refresh}
              disabled={isLoading}
              variant="outline"
              className="flex-1 sm:flex-none min-w-[120px] bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Manual Refresh</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
