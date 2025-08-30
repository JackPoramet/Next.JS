'use client';

import { useEffect, useState } from 'react';
import { useRealtimeDevices } from '../../hooks/useRealtimeDevices';

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

export default function RealtimeDashboard() {
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);
  const [showAllFaculties, setShowAllFaculties] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [hostInfo, setHostInfo] = useState<string>('');

  // ใช้ custom hook สำหรับดึงข้อมูล realtime
  const {
    devices,
    devicesByFaculty,
    stats,
    isLoading,
    isConnected,
    error,
    lastUpdated,
    connectionCount,
    refresh,
    reconnect
  } = useRealtimeDevices({
    faculty: showAllFaculties ? 'all' : selectedFaculties.join(','),
    status: selectedStatus,
    enableSSE: true,
    refreshInterval: 10000
  });

  const facultyConfig: {[key: string]: {name: string, icon: string, color: string}} = {
    'engineering': { name: 'คณะวิศวกรรมศาสตร์', icon: '🔧', color: 'blue' },
    'institution': { name: 'สถาบันเทคโนโลยี', icon: '🏛️', color: 'purple' },
    'liberal_arts': { name: 'คณะศิลปศาสตร์', icon: '📚', color: 'green' },
    'business_administration': { name: 'คณะบริหารธุรกิจ', icon: '💼', color: 'orange' },
    'architecture': { name: 'คณะสถาปัตยกรรมศาสตร์', icon: '🏗️', color: 'red' },
    'industrial_education': { name: 'คณะครุศาสตร์อุตสาหกรรม', icon: '⚙️', color: 'indigo' }
  };

  // Helper function to get filtered faculties
  const getFilteredFaculties = () => {
    if (showAllFaculties) {
      return devicesByFaculty;
    }
    
    const filtered: { [key: string]: DeviceData[] } = {};
    selectedFaculties.forEach(faculty => {
      if (devicesByFaculty[faculty]) {
        filtered[faculty] = devicesByFaculty[faculty];
      }
    });
    return filtered;
  };

  // Helper function to handle faculty selection
  const handleFacultyToggle = (facultyKey: string) => {
    setSelectedFaculties(prev => {
      if (prev.includes(facultyKey)) {
        return prev.filter(f => f !== facultyKey);
      } else {
        return [...prev, facultyKey];
      }
    });
    setShowAllFaculties(false);
  };

  // Helper function to get faculty color classes
  const getFacultyColorClasses = (color: string) => {
    const colorMap: {[key: string]: string} = {
      'blue': 'bg-blue-100 text-blue-800',
      'purple': 'bg-purple-100 text-purple-800',
      'green': 'bg-green-100 text-green-800',
      'orange': 'bg-orange-100 text-orange-800',
      'red': 'bg-red-100 text-red-800',
      'indigo': 'bg-indigo-100 text-indigo-800',
      'gray': 'bg-gray-100 text-gray-800'
    };
    return colorMap[color] || colorMap['gray'];
  };

  // Set host info after component mounts to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostInfo(`${window.location.hostname}:${window.location.port || '3000'}`);
    }
  }, []);

  // Function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  // Function to get connection status display
  const getConnectionStatusDisplay = () => {
    if (isLoading) {
      return {
        text: 'กำลังโหลด...',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: '🟡'
      };
    }
    
    if (!isConnected) {
      return {
        text: 'ไม่ได้เชื่อมต่อ',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: '🔴'
      };
    }
    
    return {
      text: 'เชื่อมต่อแล้ว',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: '🟢'
    };
  };

  const statusDisplay = getConnectionStatusDisplay();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 IoT Energy Management Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time monitoring from devices_data table using Server-Sent Events (SSE)
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Connection Status</h2>
            <div className="flex space-x-2">
              <button
                onClick={refresh}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                disabled={isLoading}
              >
                🔄 {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={reconnect}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                � Reconnect SSE
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${statusDisplay.bgColor}`}>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{statusDisplay.icon}</span>
                <div>
                  <p className="text-sm text-gray-600">SSE Status</p>
                  <p className={`font-semibold ${statusDisplay.color}`}>
                    {statusDisplay.text}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-100 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">👥</span>
                <div>
                  <p className="text-sm text-gray-600">Active Connections</p>
                  <p className="font-semibold text-blue-800">
                    {connectionCount}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-100 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="text-sm text-gray-600">Total Devices</p>
                  <p className="font-semibold text-green-800">{stats.totalDevices}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-orange-100 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">�</span>
                <div>
                  <p className="text-sm text-gray-600">Online / Offline</p>
                  <p className="font-semibold text-orange-800">
                    {stats.onlineDevices} / {stats.offlineDevices}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-700">
                <span className="font-semibold">Error:</span> {error}
              </p>
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Host: {hostInfo}</p>
            <p>Last updated: {formatTimestamp(lastUpdated)}</p>
            <p>Data source: devices_data table</p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Status Filter</h2>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🔧 All Status
            </button>
            <button
              onClick={() => setSelectedStatus('online')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedStatus === 'online'
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🟢 Online ({stats.onlineDevices})
            </button>
            <button
              onClick={() => setSelectedStatus('offline')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedStatus === 'offline'
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🔴 Offline ({stats.offlineDevices})
            </button>
          </div>
        </div>

        {/* Faculty Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Faculty Filter</h2>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setShowAllFaculties(true)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showAllFaculties 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🏛️ All Faculties
            </button>
            
            {Object.entries(facultyConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleFacultyToggle(key)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFaculties.includes(key) && !showAllFaculties
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {config.icon} {config.name}
              </button>
            ))}
          </div>
          
          <p className="text-sm text-gray-600">
            Showing: {showAllFaculties ? 'All faculties' : `${selectedFaculties.length} selected faculty(ies)`}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-gray-600">กำลังโหลดข้อมูลจากฐานข้อมูล...</span>
            </div>
          </div>
        )}

        {/* Devices by Faculty */}
        {!isLoading && (
          <div className="space-y-6">
            {Object.entries(getFilteredFaculties()).map(([facultyKey, devices]) => {
              const facultyInfo = facultyConfig[facultyKey] || { 
                name: facultyKey, 
                icon: '🏛️', 
                color: 'gray' 
              };
              
              return (
                <div key={facultyKey} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className={`p-4 ${getFacultyColorClasses(facultyInfo.color)}`}>
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <span className="text-2xl">{facultyInfo.icon}</span>
                      <span>{facultyInfo.name}</span>
                      <span className="text-sm font-normal">
                        ({devices.length} devices)
                      </span>
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    {devices.length === 0 ? (
                      <p className="text-gray-500 italic">No devices found</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {devices.map((device) => {
                          return (
                          <div key={device.device_id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-800">
                                📱 {device.device_name || device.device_id}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                device.network_status === 'online' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {device.network_status}
                              </span>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              {/* Electrical Data */}
                              {device.voltage && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Voltage:</span>
                                  <span className="font-medium">{device.voltage}V</span>
                                </div>
                              )}
                              {device.current_amperage && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Current:</span>
                                  <span className="font-medium">{device.current_amperage}A</span>
                                </div>
                              )}
                              {device.active_power && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Power:</span>
                                  <span className="font-medium">{device.active_power.toFixed(1)}W</span>
                                </div>
                              )}
                              {device.frequency && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Frequency:</span>
                                  <span className="font-medium">{device.frequency}Hz</span>
                                </div>
                              )}
                              {device.power_factor && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Power Factor:</span>
                                  <span className="font-medium">{device.power_factor}</span>
                                </div>
                              )}
                              
                              {/* Energy Data */}
                              {device.total_energy && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Total Energy:</span>
                                  <span className="font-medium">{device.total_energy}kWh</span>
                                </div>
                              )}
                              {device.daily_energy && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Daily Energy:</span>
                                  <span className="font-medium">{device.daily_energy}kWh</span>
                                </div>
                              )}
                              
                              {/* Environmental Data */}
                              {device.device_temperature && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Temperature:</span>
                                  <span className="font-medium">{device.device_temperature}°C</span>
                                </div>
                              )}
                              
                              {/* Connection Quality */}
                              <div className="flex justify-between">
                                <span className="text-gray-600">Signal Quality:</span>
                                <span className="font-medium">{device.connection_quality}%</span>
                              </div>
                              
                              <div className="flex justify-between text-xs text-gray-500 mt-3 pt-2 border-t">
                                <span>Last Update:</span>
                                <span>{formatTimestamp(device.updated_at)}</span>
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {Object.keys(getFilteredFaculties()).length === 0 && !isLoading && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500 text-lg">
                  📡 No devices found
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your filters or check if devices are registered in the database
                </p>
              </div>
            )}
          </div>
        )}

        {/* Statistics Summary */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📊 System Statistics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-100 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-800">{stats.totalDevices}</p>
                <p className="text-sm text-blue-600">Total Devices</p>
              </div>
            </div>
            
            <div className="p-4 bg-green-100 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-800">{stats.onlineDevices}</p>
                <p className="text-sm text-green-600">Online Devices</p>
              </div>
            </div>
            
            <div className="p-4 bg-red-100 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-800">{stats.offlineDevices}</p>
                <p className="text-sm text-red-600">Offline Devices</p>
              </div>
            </div>
            
            <div className="p-4 bg-purple-100 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-800">{stats.facultyCount}</p>
                <p className="text-sm text-purple-600">Active Faculties</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
