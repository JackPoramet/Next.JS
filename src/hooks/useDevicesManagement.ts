import { useState, useEffect } from 'react';

// Type definitions for devices
export interface DeviceInfo {
  id: number;
  device_id: string;
  device_name: string;
  device_type: string;
  status: 'active' | 'inactive' | 'maintenance';
  is_enabled: boolean;
  network_status: 'online' | 'offline' | 'error';
  
  // Location information
  faculty: string;
  building?: string;
  floor?: string;
  room?: string;
  position?: string;
  
  // Device information
  device_model_name?: string;
  manufacturer_name?: string;
  
  // Meter information
  meter_model_name?: string;
  meter_type: 'digital' | 'analog';
  rated_voltage?: number;
  rated_current?: number;
  rated_power?: number;
  power_phase?: 'single' | 'three';
  frequency?: number;
  
  // Network information
  ip_address?: string;
  mac_address?: string;
  connection_type?: string;
  
  // Operational information
  data_collection_interval?: number;
  responsible_person?: string;
  responsible_person_name?: string;
  responsible_person_email?: string;
  responsible_person_phone?: string;
  contact_info?: string;
  
  // Timestamps and status
  install_date?: string;
  firmware_version?: string;
  approval_status?: string;
  last_data_received?: string;
  created_at: string;
  updated_at: string;
  
  // Current sensor data
  voltage?: number;
  current_amperage?: number;
  active_power?: number;
  total_energy?: number;
  device_network_status?: string;
  power_factor?: number;
  current_frequency?: number;
  device_temperature?: number;
  
  // MQTT data
  mqtt_data?: Record<string, unknown>;
}

export interface DeviceStats {
  totalDevices: number;
  activeDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  enabledDevices: number;
  devicesByFaculty: Record<string, number>;
  devicesByType: Record<string, number>;
  devicesByMeterType: Record<string, number>;
}

interface DevicesResponse {
  success: boolean;
  message: string;
  data: {
    devices: DeviceInfo[];
    stats: DeviceStats;
  };
}

interface UseDevicesResult {
  devices: DeviceInfo[];
  stats: DeviceStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDevicesManagement = (): UseDevicesResult => {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [stats, setStats] = useState<DeviceStats>({
    totalDevices: 0,
    activeDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    enabledDevices: 0,
    devicesByFaculty: {},
    devicesByType: {},
    devicesByMeterType: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/devices', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: DevicesResponse = await response.json();

      if (result.success) {
        setDevices(result.data.devices);
        setStats(result.data.stats);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchDevices();
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return {
    devices,
    stats,
    loading,
    error,
    refetch,
  };
};
