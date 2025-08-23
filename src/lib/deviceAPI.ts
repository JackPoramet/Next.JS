// Device API client functions
import { 
  DeviceInfo, 
  DeviceData,
  DeviceProp,
  MeterProp,
  DeviceHistory,
  DevicesStats, 
  FACULTY_NAMES as FACULTY_MAPPING, 
  METER_TYPE_NAMES as METER_TYPE_MAPPING, 
  STATUS_NAMES as STATUS_MAPPING 
} from './deviceModels';

// Re-export interfaces from deviceModels for consumers
export type { 
  DeviceInfo, 
  DeviceData, 
  DeviceProp,
  MeterProp,
  DeviceHistory,
  DevicesStats 
};

// Legacy interface - สำหรับ backward compatibility
export interface Device {
  id: number;
  name: string;
  device_id?: string;
  faculty: string;
  building?: string;
  floor?: string;
  room?: string;
  position?: string;
  meter_type: 'digital' | 'analog';
  device_model?: string;
  manufacturer?: string;
  status: 'active' | 'inactive' | 'maintenance';
  network_status?: 'online' | 'offline' | 'error';
  ip_address?: string;
  installation_date?: string;
  last_maintenance?: string;
  current_reading?: number;
  voltage?: number;
  current_amperage?: number;
  power_factor?: number;
  last_data_received?: string;
  description?: string;
  notes?: string;
  updated_at: string;
  created_at: string;
}

// Response interfaces
export interface DevicesResponse {
  success: boolean;
  message: string;
  data: {
    devices: DeviceInfo[];
    stats: DevicesStats;
  };
}

export interface DeviceDetailResponse {
  success: boolean;
  message: string;
  data: {
    deviceInfo: DeviceInfo;
    deviceData: DeviceData;
    deviceHistory: DeviceHistory[];
    meterProp?: MeterProp;
  };
}

// Faculty name mappings
export const FACULTY_NAMES = FACULTY_MAPPING;

// Meter type name mappings
export const METER_TYPE_NAMES = {
  'digital': 'ดิจิทัล',
  'analog': 'อนาล็อก'
} as const;

// Status name mappings
export const STATUS_NAMES = {
  'active': 'เปิดใช้งาน',
  'inactive': 'ปิดใช้งาน',
  'maintenance': 'ซ่อมบำรุง'
} as const;

// Get authentication token from cookies
function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
  
  if (tokenCookie) {
    return tokenCookie.split('=')[1];
  }
  
  return null;
}

// Create headers with authentication
function createHeaders(): HeadersInit {
  const token = getAuthToken();
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Handle API response
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  
  if (!data.success) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
}

export const deviceAPI = {
  // Get all devices with combined data (devices_prop, devices_data)
  async getAllDevices(): Promise<DevicesResponse> {
    try {
      const response = await fetch('/api/devices/list', {
        method: 'GET',
        headers: createHeaders(),
      });

      return await handleResponse<DevicesResponse>(response);
    } catch (error) {
      console.error('[ERROR] deviceAPI.getAllDevices:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: { 
          devices: [],
          stats: {
            totalDevices: 0,
            activeDevices: 0,
            onlineDevices: 0,
            offlineDevices: 0,
            errorDevices: 0,
            devicesByFaculty: {},
            devicesByType: {}
          }
        }
      };
    }
  },

  // Get device details by ID
  async getDeviceDetail(deviceId: string): Promise<DeviceDetailResponse> {
    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'GET',
        headers: createHeaders(),
      });

      return await handleResponse<DeviceDetailResponse>(response);
    } catch (error) {
      console.error('[ERROR] deviceAPI.getDeviceDetail:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: {
          deviceInfo: {} as DeviceInfo,
          deviceData: {} as DeviceData,
          deviceHistory: []
        }
      };
    }
  },

  // Get device history data for charts
  async getDeviceHistory(deviceId: string, days: number = 7): Promise<{ success: boolean; message: string; data: { history: DeviceHistory[] } }> {
    try {
      const response = await fetch(`/api/devices/${deviceId}/history?days=${days}`, {
        method: 'GET',
        headers: createHeaders(),
      });

      return await handleResponse<{ success: boolean; message: string; data: { history: DeviceHistory[] } }>(response);
    } catch (error) {
      console.error('[ERROR] deviceAPI.getDeviceHistory:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: { history: [] }
      };
    }
  },

  // Update device property
  async updateDeviceProp(deviceId: string, deviceData: Partial<DeviceProp>): Promise<{ success: boolean; message: string; data: DeviceProp }> {
    try {
      const response = await fetch(`/api/devices/${deviceId}/properties`, {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify(deviceData),
      });

      return await handleResponse<{ success: boolean; message: string; data: DeviceProp }>(response);
    } catch (error) {
      console.error('[ERROR] deviceAPI.updateDeviceProp:', error);
      throw error;
    }
  },

  // Delete device
  async deleteDevice(deviceId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE',
        headers: createHeaders(),
      });

      return await handleResponse<{ success: boolean; message: string }>(response);
    } catch (error) {
      console.error('[ERROR] deviceAPI.deleteDevice:', error);
      throw error;
    }
  }
};
