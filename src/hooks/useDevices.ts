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
      
      const response = await deviceAPI.getAllDevices();
      if (response.success && response.data.devices) {
        setDevices(response.data.devices);
        setStats(response.data.stats);
        console.log('[DEBUG] useDevices - Devices loaded successfully');
      } else {
        throw new Error(response.message || 'Failed to fetch devices');
      }

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
