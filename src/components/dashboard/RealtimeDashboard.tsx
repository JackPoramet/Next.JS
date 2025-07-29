'use client';

import { useEffect, useState } from 'react';

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
  const [wsData, setWsData] = useState<IoTData[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [devicesByFaculty, setDevicesByFaculty] = useState<DevicesByFaculty>({});
  const [meterData, setMeterData] = useState<{[key: string]: any}>({});
  const [totalDevices, setTotalDevices] = useState<number>(0);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);
  const [showAllFaculties, setShowAllFaculties] = useState<boolean>(true);

  // Faculty configuration with icons and display names
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

  useEffect(() => {
    console.log('🌐 Initializing WebSocket connection for Real-time Dashboard...');
    let wsRef: WebSocket | null = null;
    let reconnectTimeoutId: NodeJS.Timeout | null = null;
    let isComponentMounted = true;
    
    const connectWebSocket = () => {
      if (!isComponentMounted) return null;
      
      try {
        console.log('🔗 Attempting to connect to WebSocket at ws://localhost:8080');
        
        // Clean up existing connection
        if (wsRef && wsRef.readyState !== WebSocket.CLOSED) {
          wsRef.close();
        }
        
        const ws = new WebSocket('ws://localhost:8080');
        wsRef = ws;
        
        ws.onopen = () => {
          if (!isComponentMounted) return;
          console.log('✅ WebSocket connected successfully');
          setConnectionStatus('connected');
        };
        
        ws.onmessage = (event) => {
          if (!isComponentMounted) return;
          
          try {
            const message = JSON.parse(event.data);
            console.log('📡 Received WebSocket message:', message);
            
            setTotalMessages(prev => prev + 1);
            
            // เก็บข้อมูลทั้งหมดใน wsData สำหรับ log
            setWsData(prev => [message, ...prev.slice(0, 19)]);
            
            // แยกประเภทข้อมูล - ปรับให้รองรับ topic structure ใหม่
            if (message.topic?.startsWith('devices/')) {
              // Extract department and device info from topic: devices/department/device_id
              const topicParts = message.topic.split('/');
              const department = topicParts[1];
              const deviceId = topicParts[2] || message.data.device_id;
              
              setDevicesByFaculty(prev => {
                const currentFacultyDevices = prev[department] || {};
                const deviceKey = `${department}/${deviceId}`;
                
                // Check if this is a new device
                if (!currentFacultyDevices[deviceKey]) {
                  setTotalDevices(prevTotal => prevTotal + 1);
                }
                
                return {
                  ...prev,
                  [department]: {
                    ...currentFacultyDevices,
                    [deviceKey]: {
                      ...message.data,
                      department: department,
                      device_id: deviceId,
                      timestamp: message.timestamp
                    }
                  }
                };
              });
            } else if (message.topic?.includes('/meters/') && message.topic?.includes('/reading')) {
              setMeterData(prev => ({
                ...prev,
                [message.data.meter_id]: {
                  ...message.data,
                  timestamp: message.timestamp
                }
              }));
            }
            
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        };
        
        ws.onclose = (event) => {
          if (!isComponentMounted) return;
          
          console.log('🔌 WebSocket connection closed, code:', event.code, 'reason:', event.reason);
          setConnectionStatus('disconnected');
          
          // Clear any existing reconnect timeout
          if (reconnectTimeoutId) {
            clearTimeout(reconnectTimeoutId);
          }
          
          // Attempt to reconnect after 5 seconds
          reconnectTimeoutId = setTimeout(() => {
            if (isComponentMounted) {
              console.log('🔄 Attempting WebSocket reconnection...');
              connectWebSocket();
            }
          }, 5000);
        };
        
        ws.onerror = (error) => {
          if (!isComponentMounted) return;
          
          console.error('❌ WebSocket error occurred');
          console.error('❌ WebSocket readyState:', ws.readyState);
          console.error('❌ WebSocket URL:', ws.url);
          setConnectionStatus('disconnected');
          
          // Additional error handling based on readyState
          if (ws.readyState === WebSocket.CLOSED) {
            console.log('🔄 WebSocket is closed, will attempt reconnection...');
          } else if (ws.readyState === WebSocket.CLOSING) {
            console.log('🔄 WebSocket is closing...');
          }
        };

        return ws;
      } catch (error) {
        console.error('❌ Error creating WebSocket connection:', error);
        setConnectionStatus('disconnected');
        return null;
      }
    };
    
    console.log('🚀 Starting initial WebSocket connection...');
    connectWebSocket();
    
    return () => {
      console.log('🧹 Cleaning up WebSocket connection...');
      isComponentMounted = false;
      
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
      }
      
      if (wsRef && wsRef.readyState !== WebSocket.CLOSED) {
        wsRef.close(1000, 'Component unmounting');
      }
    };
  }, []);  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">🌐 IoT Energy Real-time Dashboard</h2>
          <div className="flex items-center space-x-4">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
              connectionStatus === 'disconnected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              WebSocket: {connectionStatus}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              {totalMessages} messages
            </span>
          </div>
        </div>

        {/* Connection Status Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">📱</span>
              <span className="text-sm font-medium text-blue-800">Total Devices</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{totalDevices}</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🏛️</span>
              <span className="text-sm font-medium text-purple-800">Active Faculties</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{Object.keys(devicesByFaculty).length}</div>
          </div>
        </div>

        {/* Faculty Filter Section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900">🏢 เลือกคณะที่ต้องการแสดงผล</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowAllFaculties(true);
                  setSelectedFaculties([]);
                }}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  showAllFaculties 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🌐 แสดงทั้งหมด
              </button>
              <button
                onClick={() => {
                  setShowAllFaculties(false);
                  setSelectedFaculties(Object.keys(devicesByFaculty));
                }}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  !showAllFaculties && selectedFaculties.length === Object.keys(devicesByFaculty).length
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ✅ เลือกทั้งหมด
              </button>
              <button
                onClick={() => {
                  setShowAllFaculties(false);
                  setSelectedFaculties([]);
                }}
                className="px-3 py-2 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                🚫 ยกเลิกทั้งหมด
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.keys(facultyConfig).map(facultyKey => {
              const facultyInfo = facultyConfig[facultyKey];
              const hasDevices = devicesByFaculty[facultyKey] && Object.keys(devicesByFaculty[facultyKey]).length > 0;
              const isSelected = showAllFaculties || selectedFaculties.includes(facultyKey);
              
              return (
                <button
                  key={facultyKey}
                  onClick={() => handleFacultyToggle(facultyKey)}
                  disabled={!hasDevices}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    isSelected && hasDevices
                      ? `${getFacultyColorClasses(facultyInfo.color)} border-current shadow-sm`
                      : hasDevices
                      ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-lg">{facultyInfo.icon}</span>
                    <span className="text-xs text-center leading-tight">
                      {facultyInfo.name.split(' ')[0]}
                    </span>
                    {hasDevices && (
                      <span className="text-xs opacity-75">
                        {Object.keys(devicesByFaculty[facultyKey] || {}).length} อุปกรณ์
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            แสดงผล: {showAllFaculties ? 'ทุกคณะ' : `${selectedFaculties.length} คณะที่เลือก`}
            {!showAllFaculties && selectedFaculties.length > 0 && (
              <span className="ml-2">
                ({selectedFaculties.map(f => facultyConfig[f]?.name.split(' ')[0]).join(', ')})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Faculty Cards */}
      {Object.entries(getFilteredFaculties()).map(([facultyKey, devices]) => {
        const facultyInfo = facultyConfig[facultyKey] || { name: facultyKey, icon: '🏢', color: 'gray' };
        const deviceCount = Object.keys(devices).length;
        
        return (
          <div key={facultyKey} className="bg-white shadow rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                {`${facultyInfo.icon} ${facultyInfo.name}`}
              </h3>
              <span className="text-sm text-gray-600">{deviceCount} อุปกรณ์ที่เชื่อมต่อ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(devices).map(([deviceKey, data]) => (
                <div
                  key={deviceKey}
                  className="bg-gray-50 rounded-lg border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg">{facultyInfo.icon}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getFacultyColorClasses(facultyInfo.color)}`}>
                      {data.device_id || deviceKey.split('/')[1]}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex flex-col">
                        <span className="text-gray-500">V</span>
                        <span className="font-medium text-gray-800">{data.voltage || 'N/A'}V</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500">A</span>
                        <span className="font-medium text-gray-800">{data.current || 'N/A'}A</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500">W</span>
                        <span className="font-medium text-gray-800">{data.power || 'N/A'}W</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500">kWh</span>
                        <span className="font-medium text-gray-800">{data.energy || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Temp</span>
                        <span className="text-xs text-gray-700">{data.temperature || 'N/A'}°C</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Hz</span>
                        <span className="text-xs text-gray-700">{data.frequency || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 text-center">
                      {data.timestamp ? new Date(data.timestamp).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      }) : '--:--:--'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Empty state for faculty with no devices */}
            {deviceCount === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">{facultyInfo.icon}</div>
                <p className="text-gray-600">ยังไม่มีอุปกรณ์เชื่อมต่อในคณะนี้</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Meter Data Section */}
      {Object.keys(meterData).length > 0 && (
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">⚡ Meter Readings</h2>
            <span className="text-sm text-gray-600">ข้อมูลการอ่านค่ามิเตอร์</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(meterData).map(([meterId, data]) => (
              <div
                key={meterId}
                className="bg-emerald-50 border border-emerald-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl">⚡</span>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-medium">
                    {meterId}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex flex-col">
                      <span className="text-xs text-emerald-700">Total Energy</span>
                      <span className="font-medium text-emerald-900">{data.total_energy || 'N/A'}kWh</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-emerald-700">Peak Demand</span>
                      <span className="font-medium text-emerald-900">{data.peak_demand || 'N/A'}kW</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-emerald-700">Off-Peak Energy</span>
                      <span className="font-medium text-emerald-900">{data.off_peak_energy || 'N/A'}kWh</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-emerald-700">On-Peak Energy</span>
                      <span className="font-medium text-emerald-900">{data.on_peak_energy || 'N/A'}kWh</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-emerald-200">
                    <div className="text-xs text-emerald-700">
                      Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state when no data */}
      {Object.keys(getFilteredFaculties()).length === 0 && Object.keys(meterData).length === 0 && (
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📡</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {Object.keys(devicesByFaculty).length === 0 
                ? 'ยังไม่มีข้อมูลจากอุปกรณ์' 
                : 'ไม่มีคณะที่เลือกหรือคณะที่เลือกไม่มีอุปกรณ์'}
            </h3>
            <p className="text-gray-600 mb-4">
              {Object.keys(devicesByFaculty).length === 0 
                ? 'ตรวจสอบการเชื่อมต่อ WebSocket และอุปกรณ์ IoT'
                : 'ลองเลือกคณะอื่นหรือเลือกแสดงทั้งหมด'}
            </p>
            <span className={`px-3 py-1 rounded text-sm font-medium ${
              connectionStatus === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              WebSocket: {connectionStatus}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
