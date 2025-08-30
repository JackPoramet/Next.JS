'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

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

interface MobileCardGridProps {
  deviceData: DeviceData;
  deviceName: string;
  lastUpdate?: string;
  status: 'online' | 'offline';
}

export default function MobileCardGrid({ 
  deviceData, 
  deviceName, 
  lastUpdate, 
  status 
}: Readonly<MobileCardGridProps>) {
  // Format date to local time
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Get data from device
  const voltage = deviceData?.energy_data?.voltage ?? 0;
  const current = deviceData?.energy_data?.current ?? 0;
  const power = deviceData?.energy_data?.active_power ?? 0;
  const temperature = deviceData?.environmental_data?.temperature;

  return (
    <div className="mb-4">
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <CardHeader className="py-3 px-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium truncate">{deviceName}</CardTitle>
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              status === 'online' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                status === 'online' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {status === 'online' ? 'Online' : 'Offline'}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Last update: {formatDate(lastUpdate)}
          </p>
        </CardHeader>
        
        <CardContent className="pt-0 pb-3 px-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-primary/10 rounded-lg flex flex-col items-center">
              <span className="text-xs text-muted-foreground">Voltage</span>
              <span className="font-medium">{voltage.toFixed(1)} V</span>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg flex flex-col items-center">
              <span className="text-xs text-muted-foreground">Current</span>
              <span className="font-medium">{current.toFixed(2)} A</span>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg flex flex-col items-center">
              <span className="text-xs text-muted-foreground">Power</span>
              <span className="font-medium">{power.toFixed(1)} W</span>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg flex flex-col items-center">
              <span className="text-xs text-muted-foreground">Temp</span>
              <span className="font-medium">{temperature ? `${temperature.toFixed(1)}°C` : 'N/A'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
