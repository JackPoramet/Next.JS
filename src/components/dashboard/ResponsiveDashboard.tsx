'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import MobileCardGrid from '@/components/ui/MobileCardGrid';

interface DeviceData {
  energy_data?: {
    voltage?: number;
    current?: number;
    active_power?: number;
    frequency?: number;
    power_factor?: number;
  };
  environmental_data?: {
    temperature?: number;
  };
  lastUpdate?: string;
  timestamp?: string;
  [key: string]: unknown;
}

interface DevicesByFaculty {
  [faculty: string]: {
    [deviceKey: string]: DeviceData;
  };
}

export default function ResponsiveDashboard() {
  const [devicesByFaculty, setDevicesByFaculty] = useState<DevicesByFaculty>({});
  const [totalDevices, setTotalDevices] = useState<number>(0);
  const [lastFetchTime, setLastFetchTime] = useState<string>('');
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);
  const [showAllFaculties, setShowAllFaculties] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Check if viewport is mobile size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIsMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  // Timeout duration for offline detection (1 minute)
  const OFFLINE_TIMEOUT = 60 * 1000; // 1 minute in milliseconds

  // Determine if a device is online based on last update time
  const getDeviceStatus = (lastUpdate?: string) => {
    if (!lastUpdate) return 'offline';
    
    const lastUpdateTime = new Date(lastUpdate).getTime();
    const currentTime = new Date().getTime();
    
    return currentTime - lastUpdateTime < OFFLINE_TIMEOUT ? 'online' : 'offline';
  };

  // Fetch device data from the API
  const fetchDeviceData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/devices/data');
      
      if (!response.ok) {
        throw new Error('Failed to fetch device data');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setDevicesByFaculty(data.devicesByFaculty || {});
        
        // Calculate total devices
        let total = 0;
        Object.values(data.devicesByFaculty || {}).forEach((faculty: any) => {
          total += Object.keys(faculty).length;
        });
        
        setTotalDevices(total);
        setLastFetchTime(new Date().toISOString());
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch device data');
      }
    } catch (err) {
      console.error('Error fetching device data:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on component mount and then every 30 seconds
  useEffect(() => {
    fetchDeviceData();
    
    const interval = setInterval(() => {
      fetchDeviceData();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchDeviceData]);

  // Toggle faculty selection
  const toggleFaculty = (faculty: string) => {
    setSelectedFaculties((prev) => {
      if (prev.includes(faculty)) {
        return prev.filter((f) => f !== faculty);
      } else {
        return [...prev, faculty];
      }
    });
  };

  // Toggle showing all faculties
  const toggleShowAll = () => {
    setShowAllFaculties((prev) => !prev);
    if (!showAllFaculties) {
      setSelectedFaculties([]);
    }
  };

  // Filter faculties based on selection
  const filteredDevicesByFaculty = showAllFaculties
    ? devicesByFaculty
    : Object.keys(devicesByFaculty)
        .filter((faculty) => selectedFaculties.includes(faculty))
        .reduce((obj, faculty) => {
          obj[faculty] = devicesByFaculty[faculty];
          return obj;
        }, {} as DevicesByFaculty);

  return (
    <div className={`container mx-auto ${isMobile ? 'px-2' : 'px-4'} py-4`}>
      {/* Dashboard Header */}
      <div className={`mb-6 ${isMobile ? 'flex flex-col' : 'flex justify-between items-center'}`}>
        <h1 className={`${isMobile ? 'text-xl mb-3' : 'text-2xl'} font-bold text-gray-900 dark:text-white`}>
          Energy Monitoring Dashboard
        </h1>
        
        <div className={`${isMobile ? 'grid grid-cols-2 gap-2' : 'flex space-x-2'}`}>
          <Card className={`${isMobile ? 'p-2' : 'p-3'} bg-primary/5 border-primary/20`}>
            <div className="flex items-center">
              <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>Total Devices</p>
                <p className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-foreground`}>
                  {totalDevices}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className={`${isMobile ? 'p-2' : 'p-3'} bg-primary/5 border-primary/20`}>
            <div className="flex items-center">
              <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>Last Update</p>
                <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold text-foreground`}>
                  {lastFetchTime ? new Date(lastFetchTime).toLocaleTimeString() : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Faculty Filter - Collapsible on Mobile */}
      <div className={`mb-4 ${isMobile ? 'px-1' : 'px-4'} py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700`}>
        <div className="flex justify-between items-center">
          <h2 className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-gray-900 dark:text-gray-100`}>
            Faculty Filter
          </h2>
          <button
            onClick={toggleShowAll}
            className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'} rounded-md ${
              showAllFaculties
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {showAllFaculties ? 'All Faculties' : 'Selected Only'}
          </button>
        </div>
        
        {!showAllFaculties && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.keys(devicesByFaculty).map((faculty) => (
              <button
                key={faculty}
                onClick={() => toggleFaculty(faculty)}
                className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'} rounded-md ${
                  selectedFaculties.includes(faculty)
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {faculty}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Loading State */}
      {isLoading && Object.keys(devicesByFaculty).length === 0 && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="py-4 px-4 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 mb-4">
          <p className="font-medium">Error loading device data:</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Device Grid */}
      {Object.keys(filteredDevicesByFaculty).length > 0 && (
        <div className="space-y-6">
          {Object.entries(filteredDevicesByFaculty).map(([faculty, devices]) => (
            <div key={faculty}>
              <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-semibold text-gray-900 dark:text-white mb-3`}>
                {faculty}
              </h2>
              
              {isMobile ? (
                // Mobile Layout - Cards stack vertically
                <div className="space-y-3">
                  {Object.entries(devices).map(([deviceName, deviceData]) => (
                    <MobileCardGrid
                      key={deviceName}
                      deviceName={deviceName}
                      deviceData={deviceData}
                      lastUpdate={deviceData.lastUpdate || deviceData.timestamp as string}
                      status={getDeviceStatus(deviceData.lastUpdate || deviceData.timestamp as string) as 'online' | 'offline'}
                    />
                  ))}
                </div>
              ) : (
                // Desktop Layout - Grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Object.entries(devices).map(([deviceName, deviceData]) => (
                    <Card key={deviceName} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base font-medium truncate">{deviceName}</CardTitle>
                          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            getDeviceStatus(deviceData.lastUpdate || deviceData.timestamp as string) === 'online' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            <span className={`w-2 h-2 rounded-full mr-1 ${
                              getDeviceStatus(deviceData.lastUpdate || deviceData.timestamp as string) === 'online' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            {getDeviceStatus(deviceData.lastUpdate || deviceData.timestamp as string) === 'online' ? 'Online' : 'Offline'}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last update: {deviceData.lastUpdate || deviceData.timestamp 
                            ? new Date(deviceData.lastUpdate || deviceData.timestamp as string).toLocaleTimeString() 
                            : 'N/A'}
                        </p>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <p className="text-xs text-muted-foreground">Voltage</p>
                            <p className="text-lg font-medium">{deviceData.energy_data?.voltage?.toFixed(1) || 'N/A'} V</p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <p className="text-xs text-muted-foreground">Current</p>
                            <p className="text-lg font-medium">{deviceData.energy_data?.current?.toFixed(2) || 'N/A'} A</p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <p className="text-xs text-muted-foreground">Power</p>
                            <p className="text-lg font-medium">{deviceData.energy_data?.active_power?.toFixed(1) || 'N/A'} W</p>
                          </div>
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <p className="text-xs text-muted-foreground">Temperature</p>
                            <p className="text-lg font-medium">
                              {deviceData.environmental_data?.temperature 
                                ? `${deviceData.environmental_data.temperature.toFixed(1)}°C` 
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* No devices state */}
      {!isLoading && Object.keys(filteredDevicesByFaculty).length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No devices found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {showAllFaculties 
              ? 'No devices are currently available.' 
              : 'No devices found in the selected faculties.'}
          </p>
        </div>
      )}
    </div>
  );
}
