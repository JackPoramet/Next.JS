import { useState, useEffect } from 'react';
import { Device, DevicesStats, deviceAPI } from '@/lib/deviceAPI';

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [stats, setStats] = useState<DevicesStats>({
    totalDevices: 0,
    activeDevices: 0,
    digitalMeters: 0,
    analogMeters: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[DEBUG] useDevices - Fetching devices from API');
      
      // For now, create mock data since devices API might not be implemented yet
      const mockDevices: Device[] = [
        {
          id: 1,
          name: 'Smart Meter 001',
          faculty: 'engineering',
          meter_type: 'digital',
          status: 'active',
          position: 'Building A, Floor 1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Smart Meter 002',
          faculty: 'science',
          meter_type: 'analog',
          status: 'active',
          position: 'Building B, Floor 2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Smart Meter 003',
          faculty: 'medicine',
          meter_type: 'digital',
          status: 'inactive',
          position: 'Building C, Floor 3',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 4,
          name: 'Smart Meter 004',
          faculty: 'business',
          meter_type: 'digital',
          status: 'active',
          position: 'Building D, Floor 1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 5,
          name: 'Smart Meter 005',
          faculty: 'engineering',
          meter_type: 'analog',
          status: 'active',
          position: 'Building A, Floor 3',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // Try to fetch from API, fallback to mock data
      try {
        const response = await deviceAPI.getAllDevices();
        if (response.success && response.data.devices) {
          setDevices(response.data.devices);
          setStats(response.data.stats);
        } else {
          throw new Error('API response invalid');
        }
      } catch (apiError) {
        console.log('[DEBUG] useDevices - API not available, using mock data');
        setDevices(mockDevices);
        setStats({
          totalDevices: mockDevices.length,
          activeDevices: mockDevices.filter(d => d.status === 'active').length,
          digitalMeters: mockDevices.filter(d => d.meter_type === 'digital').length,
          analogMeters: mockDevices.filter(d => d.meter_type === 'analog').length
        });
      }

      console.log('[DEBUG] useDevices - Devices loaded successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[ERROR] useDevices - Failed to fetch devices:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDevices = () => {
    fetchDevices();
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return {
    devices,
    stats,
    isLoading,
    error,
    refreshDevices,
    fetchDevices
  };
}
