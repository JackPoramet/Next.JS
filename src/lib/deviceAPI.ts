// Device API client functions

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

export interface DevicesStats {
  totalDevices: number;
  activeDevices: number;
  digitalMeters: number;
  analogMeters: number;
  onlineDevices?: number;
  offlineDevices?: number;
}

export interface DevicesResponse {
  success: boolean;
  message: string;
  data: {
    devices: Device[];
    stats: DevicesStats;
  };
}

// Faculty name mappings
export const FACULTY_NAMES = {
  'institution': 'สำนักงาน/บริหาร',
  'engineering': 'คณะวิศวกรรมศาสตร์',
  'liberal_arts': 'คณะศิลปศาสตร์',
  'business_administration': 'คณะบริหารธุรกิจ',
  'architecture': 'คณะสถาปัตยกรรมศาสตร์',
  'industrial_education': 'คณะครุศาสตร์อุตสาหกรรม'
} as const;

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
  // Get all devices
  async getAllDevices(): Promise<DevicesResponse> {
    try {
      const response = await fetch('/api/devices', {
        method: 'GET',
        headers: createHeaders(),
      });

      return await handleResponse<DevicesResponse>(response);
    } catch (error) {
      console.error('[ERROR] deviceAPI.getAllDevices:', error);
      throw error;
    }
  },

  // Get single device
  async getDevice(id: number): Promise<{ success: boolean; message: string; data: Device }> {
    try {
      const response = await fetch(`/api/devices/${id}`, {
        method: 'GET',
        headers: createHeaders(),
      });

      return await handleResponse<{ success: boolean; message: string; data: Device }>(response);
    } catch (error) {
      console.error('[ERROR] deviceAPI.getDevice:', error);
      throw error;
    }
  },

  // Create new device
  async createDevice(deviceData: Omit<Device, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; message: string; data: Device }> {
    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(deviceData),
      });

      return await handleResponse<{ success: boolean; message: string; data: Device }>(response);
    } catch (error) {
      console.error('[ERROR] deviceAPI.createDevice:', error);
      throw error;
    }
  },

  // Update device
  async updateDevice(id: number, deviceData: Partial<Omit<Device, 'id' | 'created_at' | 'updated_at'>>): Promise<{ success: boolean; message: string; data: Device }> {
    try {
      const response = await fetch(`/api/devices/${id}`, {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify(deviceData),
      });

      return await handleResponse<{ success: boolean; message: string; data: Device }>(response);
    } catch (error) {
      console.error('[ERROR] deviceAPI.updateDevice:', error);
      throw error;
    }
  },

  // Delete device
  async deleteDevice(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/devices/${id}`, {
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
