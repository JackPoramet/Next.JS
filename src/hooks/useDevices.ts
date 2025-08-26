import { useState, useEffect } from 'react';
import { DeviceInfo, DevicesStats } from '@/lib/deviceAPI';

export function useDevices() {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [stats, setStats] = useState<DevicesStats>({
    totalDevices: 0,
    activeDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    errorDevices: 0,
    devicesByFaculty: {},
    devicesByType: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    // ปิดใช้งานการดึงข้อมูล devices
    console.log('[INFO] useDevices - Device system disabled');
    setDevices([]);
    setStats({
      totalDevices: 0,
      activeDevices: 0,
      onlineDevices: 0,
      offlineDevices: 0,
      errorDevices: 0,
      devicesByFaculty: {},
      devicesByType: {}
    });
    setIsLoading(false);
    setError(null);
  };

  const refreshDevices = () => {
    console.log('[INFO] useDevices - Device refresh disabled');
    // ไม่ทำอะไร
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
