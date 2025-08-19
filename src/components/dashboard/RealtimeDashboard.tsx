'use client';

import { useEffect, useState } from 'react';
import { useSSE } from '../../hooks/useSSE';
import type { SSEMessage } from '../../types/sse';

interface IoTData {
  topic: string;
  data: any;
  timestamp: string;
}

interface DevicesByFaculty {
  [faculty: string]: {
    [deviceKey: string]: any;
  };
}

export default function RealtimeDashboard() {
  const [devicesByFaculty, setDevicesByFaculty] = useState<DevicesByFaculty>({});
  const [meterData, setMeterData] = useState<{[key: string]: any}>({});
  const [totalDevices, setTotalDevices] = useState<number>(0);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);
  const [showAllFaculties, setShowAllFaculties] = useState<boolean>(true);
  const [hostInfo, setHostInfo] = useState<string>('');

  // Timeout duration for offline detection (1 minute)
  const OFFLINE_TIMEOUT = 60 * 1000; // 1 minute in milliseconds

  // Helper function to check if device is online based on last update time
  const isDeviceOnline = (lastUpdate: string) => {
    const now = new Date().getTime();
    const updateTime = new Date(lastUpdate).getTime();
    return (now - updateTime) <= OFFLINE_TIMEOUT;
  };

  // Helper function to get device status
  const getDeviceStatus = (deviceData: any) => {
    const lastUpdate = deviceData.lastUpdate || deviceData.timestamp;
    return isDeviceOnline(lastUpdate) ? 'online' : 'offline';
  };

  // Periodic check for offline devices
  useEffect(() => {
    const interval = setInterval(() => {
      setDevicesByFaculty(prev => {
        const updated = { ...prev };
        let hasChanges = false;
        
        Object.keys(updated).forEach(faculty => {
          Object.keys(updated[faculty]).forEach(deviceKey => {
            const device = updated[faculty][deviceKey];
            const currentStatus = getDeviceStatus(device);
            const storedStatus = device.computedStatus || 'online';
            
            if (currentStatus !== storedStatus) {
              updated[faculty][deviceKey] = {
                ...device,
                computedStatus: currentStatus
              };
              hasChanges = true;
            }
          });
        });
        
        return hasChanges ? updated : prev;
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [OFFLINE_TIMEOUT]);
  const facultyConfig: {[key: string]: {name: string, icon: string, color: string}} = {
    'engineering': { name: 'คณะวิศวกรรมศาสตร์', icon: '🔧', color: 'blue' },
    'institution': { name: 'สถาบันเทคโนโลยี', icon: '🏛️', color: 'purple' },
    'liberal_arts': { name: 'คณะศิลปศาสตร์', icon: '📚', color: 'green' },
    'business_administration': { name: 'คณะบริหารธุรกิจ', icon: '💼', color: 'orange' },
    'architecture': { name: 'คณะสถาปัตยกรรมศาสตร์', icon: '🏗️', color: 'red' },
    'industrial_education': { name: 'คณะครุศาสตร์อุตสาหกรรม', icon: '⚙️', color: 'indigo' }
  };

  // ฟังก์ชันสำหรับจัดการข้อมูลจาก SSE
  const handleSSEData = (topic: string, data: any) => {
    setTotalMessages(prev => prev + 1);
    
    console.log(`📊 Processing SSE data for topic: ${topic}`);
    
    // Extract faculty and device from topic (e.g., "devices/engineering/device1/datas")
    const topicParts = topic.split('/');
    
    // Only process topics ending with '/datas'
    if (topicParts.length >= 4 && topicParts[0] === 'devices' && topicParts[3] === 'datas') {
      const faculty = topicParts[1];
      const deviceKey = topicParts[2];
      
      console.log(`📡 Processing datas topic for faculty: ${faculty}, device: ${deviceKey}`);
      
      // อัปเดต devices by faculty
      setDevicesByFaculty(prev => {
        const updated = { ...prev };
        if (!updated[faculty]) {
          updated[faculty] = {};
        }
        updated[faculty][deviceKey] = {
          ...data,
          lastUpdate: new Date().toISOString(),
          topic: topic,
          computedStatus: 'online' // Device is online if sending data
        };
        return updated;
      });
      
      // อัปเดต total devices
      setTotalDevices(prev => {
        const allDevices = new Set<string>();
        Object.values(devicesByFaculty).forEach(facultyDevices => {
          Object.keys(facultyDevices).forEach(deviceKey => {
            allDevices.add(deviceKey);
          });
        });
        return allDevices.size;
      });
    } else {
      console.log(`⏭️ Skipping non-datas topic: ${topic}`);
    }
    
    // Handle meter data if applicable
    if (data.meter_id) {
      setMeterData(prev => ({
        ...prev,
        [data.meter_id]: {
          ...data,
          lastUpdate: new Date().toISOString(),
          topic: topic
        }
      }));
    }
  };

  // ใช้ SSE hook
  const {
    isConnected,
    connectionStatus,
    lastMessage,
    error,
    reconnect,
    connectionStats
  } = useSSE({
    url: '/api/sse',
    onMessage: (message: SSEMessage) => {
      if (message.type === 'data' && message.topic && message.data) {
        handleSSEData(message.topic, message.data);
      }
    },
    onOpen: () => {
      console.log('✅ SSE connected successfully');
    },
    onError: (error) => {
      console.error('❌ SSE connection error:', error);
    },
    onClose: () => {
      console.log('🔌 SSE connection closed');
    }
  });

  // Helper function to get filtered faculties
  const getFilteredFaculties = () => {
    if (showAllFaculties) {
      return devicesByFaculty;
    }
    
    const filtered: DevicesByFaculty = {};
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

  // เริ่มต้น services เมื่อ component mount
  useEffect(() => {
    const startServices = async () => {
      try {
        console.log('🚀 Starting MQTT and SSE services...');
        const response = await fetch('/api/start-services');
        const result = await response.json();
        console.log('📡 Start services response:', result);
      } catch (error) {
        console.error('❌ Failed to start services:', error);
      }
    };

    startServices();
  }, []);

  // Function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('th-TH');
    } catch {
      return timestamp;
    }
  };

  // Function to get connection status display
  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          text: 'เชื่อมต่อแล้ว',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: '🟢'
        };
      case 'connecting':
        return {
          text: 'กำลังเชื่อมต่อ...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: '🟡'
        };
      case 'disconnected':
        return {
          text: 'ไม่ได้เชื่อมต่อ',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: '⚪'
        };
      case 'error':
        return {
          text: 'เกิดข้อผิดพลาด',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: '🔴'
        };
      default:
        return {
          text: 'ไม่ทราบสถานะ',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: '⚪'
        };
    }
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
            Real-time monitoring system using Server-Sent Events (SSE)
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Connection Status</h2>
            <button
              onClick={reconnect}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              🔄 Reconnect
            </button>
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
                    {connectionStats.totalConnections}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-100 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="text-sm text-gray-600">Total Devices</p>
                  <p className="font-semibold text-green-800">{totalDevices}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-purple-100 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📨</span>
                <div>
                  <p className="text-sm text-gray-600">Messages Received</p>
                  <p className="font-semibold text-purple-800">{totalMessages}</p>
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
            {lastMessage && (
              <p>Last message: {formatTimestamp(lastMessage.timestamp)}</p>
            )}
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

        {/* Devices by Faculty */}
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
                      ({Object.keys(devices).length} devices)
                    </span>
                  </h3>
                </div>
                
                <div className="p-6">
                  {Object.keys(devices).length === 0 ? (
                    <p className="text-gray-500 italic">No devices found</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(devices).map(([deviceKey, deviceData]) => {
                        const deviceStatus = getDeviceStatus(deviceData);
                        return (
                        <div key={deviceKey} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-800">
                              📱 {deviceKey}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              deviceStatus === 'online' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {deviceStatus}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            {/* Energy Data */}
                            {deviceData.energy_data?.voltage && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Voltage:</span>
                                <span className="font-medium">{deviceData.energy_data.voltage}V</span>
                              </div>
                            )}
                            {deviceData.energy_data?.current && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Current:</span>
                                <span className="font-medium">{deviceData.energy_data.current}A</span>
                              </div>
                            )}
                            {deviceData.energy_data?.active_power && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Power:</span>
                                <span className="font-medium">{deviceData.energy_data.active_power.toFixed(1)}W</span>
                              </div>
                            )}
                            {deviceData.energy_data?.frequency && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Frequency:</span>
                                <span className="font-medium">{deviceData.energy_data.frequency}Hz</span>
                              </div>
                            )}
                            {deviceData.energy_data?.power_factor && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Power Factor:</span>
                                <span className="font-medium">{deviceData.energy_data.power_factor}</span>
                              </div>
                            )}
                            
                            {/* Environmental Data */}
                            {deviceData.environmental_data?.temperature && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Temperature:</span>
                                <span className="font-medium">{deviceData.environmental_data.temperature}°C</span>
                              </div>
                            )}
                            
                            {/* Device Status */}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className={`font-medium ${
                                deviceStatus === 'online' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {deviceStatus}
                              </span>
                            </div>
                            
                            <div className="flex justify-between text-xs text-gray-500 mt-3 pt-2 border-t">
                              <span>Last Update:</span>
                              <span>{formatTimestamp(deviceData.lastUpdate || deviceData.timestamp)}</span>
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
          
          {Object.keys(getFilteredFaculties()).length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500 text-lg">
                📡 Waiting for device data...
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Make sure MQTT devices are sending data to the configured topics
              </p>
            </div>
          )}
        </div>

        {/* Meter Data */}
        {Object.keys(meterData).length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📊 Meter Readings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(meterData).map(([meterId, data]) => (
                <div key={meterId} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    📟 {meterId}
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    {data.total_energy && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Energy:</span>
                        <span className="font-medium">{data.total_energy}kWh</span>
                      </div>
                    )}
                    {data.daily_energy && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily Energy:</span>
                        <span className="font-medium">{data.daily_energy}kWh</span>
                      </div>
                    )}
                    {data.monthly_energy && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Energy:</span>
                        <span className="font-medium">{data.monthly_energy}kWh</span>
                      </div>
                    )}
                    {data.peak_demand && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Peak Demand:</span>
                        <span className="font-medium">{data.peak_demand}kW</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-gray-500 mt-3 pt-2 border-t">
                      <span>Last Update:</span>
                      <span>{formatTimestamp(data.lastUpdate || data.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
