'use client';

import { useState, useEffect, useRef } from 'react';
import { useSSE } from '@/hooks/useSSE';

interface ConnectionStatus {
  status: 'checking' | 'connected' | 'disconnected' | 'error';
  message: string;
  lastCheck?: string;
  details?: any;
}

interface SystemCheck {
  database: ConnectionStatus;
  mqtt: ConnectionStatus;
  sse: ConnectionStatus;
  api: ConnectionStatus;
}

interface MQTTTopicData {
  topic: string;
  data: any;
  timestamp: string;
  count: number;
}

export default function SystemCheckDashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemCheck>({
    database: { status: 'checking', message: 'Checking...' },
    mqtt: { status: 'checking', message: 'Checking...' },
    sse: { status: 'checking', message: 'Checking...' },
    api: { status: 'checking', message: 'Checking...' }
  });

  // MQTT Related States
  const [mqttTopics, setMqttTopics] = useState<{[key: string]: MQTTTopicData}>({});
  const [mqttConnectionStatus, setMqttConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [totalMqttMessages, setTotalMqttMessages] = useState<number>(0);

  // UI Filter States
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');

  // WebSocket Raw Viewer States - REMOVED
  // const [showRawViewer, setShowRawViewer] = useState<boolean>(false);
  // const [wsMessages, setWsMessages] = useState<WebSocketMessage[]>([]);
  // const [maxMessages, setMaxMessages] = useState<number>(100);
  // const [autoScroll, setAutoScroll] = useState<boolean>(true);
  // const [filterMessageType, setFilterMessageType] = useState<string>('all');
  // const messagesEndRef = useRef<HTMLDivElement>(null);

  // API Test States
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [requestMethod, setRequestMethod] = useState<string>('GET');
  const [requestBody, setRequestBody] = useState<string>('');
  const [requestHeaders, setRequestHeaders] = useState<string>('{"Content-Type": "application/json"}');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseTime, setResponseTime] = useState<number>(0);

  const apiEndpoints = [
    { category: 'Authentication', endpoint: '/api/auth/verify', method: 'GET', description: 'Verify Token', body: '' },
    { category: 'Authentication', endpoint: '/api/auth/login', method: 'POST', description: 'User Login', body: '{\n  "email": "admin@example.com",\n  "password": "password123"\n}' },
    { category: 'Users', endpoint: '/api/users', method: 'GET', description: 'Get All Users', body: '' },
    { category: 'Users', endpoint: '/api/users', method: 'POST', description: 'Create User', body: '{\n  "name": "John Doe",\n  "email": "john@example.com",\n  "password": "password123",\n  "role": "user"\n}' },
    { category: 'Devices', endpoint: '/api/devices', method: 'GET', description: 'Get All Devices', body: '' },
    { category: 'Devices', endpoint: '/api/devices', method: 'POST', description: 'Create Device', body: '{\n  "device_name": "Smart Meter 001",\n  "device_id": "SM001",\n  "location": "Building A - Floor 1",\n  "faculty": "engineering",\n  "meter_type": "smart_meter",\n  "installation_date": "2024-01-15"\n}' },
    { category: 'Profile', endpoint: '/api/profile', method: 'GET', description: 'Get Profile', body: '' },
    { category: 'Profile', endpoint: '/api/profile', method: 'PUT', description: 'Update Profile', body: '{\n  "name": "Updated Name",\n  "email": "updated@example.com"\n}' },
    { category: 'System', endpoint: '/api/start-services', method: 'GET', description: 'Start Services', body: '' },
    { category: 'System', endpoint: '/api/sse-status', method: 'GET', description: 'SSE Status', body: '' },
  ];

  const groupedEndpoints = apiEndpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) {
      acc[endpoint.category] = [];
    }
    acc[endpoint.category].push(endpoint);
    return acc;
  }, {} as Record<string, typeof apiEndpoints>);

  // Helper functions for MQTT topics
  const getDepartmentFromTopic = (topic: string) => {
    const parts = topic.split('/');
    if (parts.length >= 2) {
      return parts[1];
    }
    return 'unknown';
  };

  const getDeviceIdFromTopic = (topic: string) => {
    const parts = topic.split('/');
    if (parts.length >= 3) {
      return parts[2];
    }
    return 'unknown';
  };

  const getTopicType = (topic: string) => {
    const parts = topic.split('/');
    if (parts.length >= 4) {
      return parts[3]; // 'datas' or 'prop'
    }
    return 'unknown';
  };

  const getFilteredTopics = () => {
    let filteredTopics = mqttTopics;
    
    // Filter only 'datas' topics for display
    filteredTopics = Object.fromEntries(
      Object.entries(filteredTopics).filter(([topic]) => 
        getTopicType(topic) === 'datas'
      )
    );
    
    if (topicFilter) {
      filteredTopics = Object.fromEntries(
        Object.entries(filteredTopics).filter(([topic]) => 
          topic.toLowerCase().includes(topicFilter.toLowerCase())
        )
      );
    }
    
    if (selectedTopic !== 'all') {
      filteredTopics = Object.fromEntries(
        Object.entries(filteredTopics).filter(([topic]) => 
          getDepartmentFromTopic(topic) === selectedTopic
        )
      );
    }
    
    return filteredTopics;
  };

  const getUniqueDepartments = () => {
    const departments = Object.keys(mqttTopics).map(getDepartmentFromTopic);
    return [...new Set(departments)].sort();
  };

  const getDepartmentIcon = (department: string) => {
    const icons: {[key: string]: string} = {
      'engineering': '🔧',
      'institution': '🏛️',
      'liberal_arts': '📚',
      'business_administration': '💼',
      'architecture': '🏗️',
      'industrial_education': '⚙️',
      'system': '🖥️',
      'unknown': '❓'
    };
    return icons[department] || '📱';
  };

  // Check Database Connection
  const checkDatabase = async () => {
    setSystemStatus(prev => ({ 
      ...prev, 
      database: { status: 'checking', message: 'Checking database connection...' } 
    }));
    
    try {
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setSystemStatus(prev => ({ 
          ...prev, 
          database: { 
            status: 'connected', 
            message: 'Database connected successfully',
            lastCheck: new Date().toLocaleTimeString()
          } 
        }));
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setSystemStatus(prev => ({ 
        ...prev, 
        database: { 
          status: 'error', 
          message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          lastCheck: new Date().toLocaleTimeString()
        } 
      }));
    }
  };

  // Check MQTT Connection
  const checkMQTT = async () => {
    setSystemStatus(prev => ({ 
      ...prev, 
      mqtt: { status: 'checking', message: 'Checking MQTT connection...' } 
    }));
    
    try {
      const response = await fetch('/api/start-services');
      const data = await response.json();
      
      if (response.ok && data.mqtt && data.mqtt.status === 'connected') {
        setSystemStatus(prev => ({ 
          ...prev, 
          mqtt: { 
            status: 'connected', 
            message: `MQTT connected to ${data.mqtt.broker}`,
            lastCheck: new Date().toLocaleTimeString(),
            details: data.mqtt
          } 
        }));
      } else {
        throw new Error(data.mqtt?.message || 'MQTT connection failed');
      }
    } catch (error) {
      setSystemStatus(prev => ({ 
        ...prev, 
        mqtt: { 
          status: 'error', 
          message: `MQTT connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          lastCheck: new Date().toLocaleTimeString()
        } 
      }));
    }
  };

  // Check SSE Connection
  const checkSSE = async () => {
    setSystemStatus(prev => ({ 
      ...prev, 
      sse: { status: 'checking', message: 'Checking SSE connection...' } 
    }));
    
    try {
      const response = await fetch('/api/sse-status');
      const data = await response.json();
      
      if (response.ok && data.success) {
        const totalConnections = data.data?.totalConnections || 0;
        setSystemStatus(prev => ({ 
          ...prev, 
          sse: { 
            status: 'connected', 
            message: `SSE server running with ${totalConnections} active connections`,
            lastCheck: new Date().toLocaleTimeString(),
            details: data.data || {}
          } 
        }));
      } else {
        throw new Error(data.message || 'SSE connection failed');
      }
    } catch (error) {
      setSystemStatus(prev => ({ 
        ...prev, 
        sse: { 
          status: 'error', 
          message: `SSE connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          lastCheck: new Date().toLocaleTimeString()
        } 
      }));
    }
  };

  // Check API Connection
  const checkAPI = async () => {
    setSystemStatus(prev => ({ 
      ...prev, 
      api: { status: 'checking', message: 'Checking API connection...' } 
    }));
    
    try {
      // ใช้ start-services API เพื่อทดสอบว่า server ตอบสนองปกติ
      const response = await fetch('/api/start-services');
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSystemStatus(prev => ({ 
          ...prev, 
          api: { 
            status: 'connected', 
            message: 'API is responding normally',
            lastCheck: new Date().toLocaleTimeString(),
            details: { 
              status: response.status,
              responseTime: '< 1s'
            }
          } 
        }));
      } else {
        throw new Error(`API returned status: ${response.status} - ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      setSystemStatus(prev => ({ 
        ...prev, 
        api: { 
          status: 'error', 
          message: `API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          lastCheck: new Date().toLocaleTimeString()
        } 
      }));
    }
  };

  // Check All Systems
  const checkAllSystems = async () => {
    setSystemStatus({
      database: { status: 'checking', message: 'Checking...' },
      mqtt: { status: 'checking', message: 'Checking...' },
      sse: { status: 'checking', message: 'Checking...' },
      api: { status: 'checking', message: 'Checking...' }
    });

    await Promise.all([
      checkDatabase(),
      checkMQTT(),
      checkSSE(),
      checkAPI()
    ]);
  };

  // SSE connection for MQTT monitoring
  const { isConnected } = useSSE({
    onMessage: (message) => {
      try {
        console.log('🎯 CLIENT: SSE message received in SystemCheckDashboard:', message);
        
        // รองรับทั้ง format เก่าและใหม่
        let topic: string | undefined, payload: any = undefined, messageType: string = 'unknown';
        
        if (message.type === 'data' && message.data && typeof message.data === 'object' && message.data.type === 'mqtt') {
          // Format เก่า: {type: 'data', data: {type: 'mqtt', topic: '...', payload: '...'}}
          topic = message.data.topic;
          payload = message.data.payload;
          messageType = 'mqtt';
          console.log('🔄 CLIENT: Using old MQTT format');
        } else if (message.type === 'data' && message.topic && message.data) {
          // Format ใหม่: {type: 'data', topic: '...', data: '...', timestamp: '...'}
          topic = message.topic;
          payload = message.data;
          messageType = 'direct';
          console.log('🔄 CLIENT: Using new direct format');
        }
        
        if (topic && payload !== undefined) {
          const timestamp = message.timestamp || new Date().toISOString();
          
          console.log('📡 CLIENT: Processing MQTT topic:', topic, 'with payload:', payload, 'type:', messageType);
          
          setMqttTopics(prev => {
            console.log('📊 CLIENT: Current topics before update:', Object.keys(prev), 'total:', Object.keys(prev).length);
            const existingTopic = prev[topic as string];
            const newTopics = {
              ...prev,
              [topic as string]: {
                topic: topic as string,
                data: payload,
                timestamp,
                count: existingTopic ? existingTopic.count + 1 : 1
              }
            };
            console.log('📊 CLIENT: Updated topics:', Object.keys(newTopics), 'total:', Object.keys(newTopics).length);
            console.log('📊 CLIENT: Topic data for', topic, ':', newTopics[topic as string]);
            return newTopics;
          });
          
          setTotalMqttMessages(prev => {
            const newCount = prev + 1;
            console.log('📈 CLIENT: Total MQTT messages updated:', newCount);
            return newCount;
          });
        } else {
          console.log('❌ CLIENT: Message does not contain MQTT data:', message);
          console.log('❌ CLIENT: Message type:', message.type);
          console.log('❌ CLIENT: Message structure:', JSON.stringify(message, null, 2));
        }
      } catch (error) {
        console.error('❌ CLIENT: Error processing SSE message:', error);
        console.error('❌ CLIENT: Raw message that failed to parse:', message);
      }
    }
  });

  // อัปเดต MQTT connection status จาก SSE
  useEffect(() => {
    console.log('🔗 CLIENT: SSE isConnected changed:', isConnected);
    if (isConnected) {
      setMqttConnectionStatus('connected');
      console.log('✅ CLIENT: SSE connected for MQTT monitoring');
    } else {
      setMqttConnectionStatus('disconnected');
      console.log('❌ CLIENT: SSE disconnected from MQTT monitoring');
    }
  }, [isConnected]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('📊 CLIENT: totalMqttMessages updated:', totalMqttMessages);
  }, [totalMqttMessages]);

  useEffect(() => {
    console.log('📊 CLIENT: mqttTopics updated:', Object.keys(mqttTopics), 'total:', Object.keys(mqttTopics).length);
  }, [mqttTopics]);

  // Test API endpoint
  const handleTestApi = async () => {
    if (!selectedEndpoint) return;
    
    setIsLoading(true);
    setResponse(null);
    const startTime = Date.now();

    try {
      let headers: any = {
        'Content-Type': 'application/json'
      };

      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        const customHeaders = JSON.parse(requestHeaders);
        headers = { ...headers, ...customHeaders };
      } catch (error) {
        console.error('Invalid headers JSON:', error);
      }

      const fetchOptions: RequestInit = {
        method: requestMethod,
        headers
      };

      if (requestMethod !== 'GET' && requestBody) {
        fetchOptions.body = requestBody;
      }

      const response = await fetch(selectedEndpoint, fetchOptions);
      const responseData = await response.text();
      
      let parsedData;
      try {
        parsedData = JSON.parse(responseData);
      } catch {
        parsedData = responseData;
      }

      const endTime = Date.now();
      setResponseTime(endTime - startTime);

      setResponse({
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: parsedData
      });

    } catch (error) {
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      
      setResponse({
        error: true,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-check systems on component mount
  useEffect(() => {
    checkAllSystems();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">🔧 System Check Dashboard</h2>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button 
              onClick={checkAllSystems}
              className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Check All Systems</span>
            </button>
          </div>
        </div>

        {/* System Status Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className={`p-3 sm:p-4 rounded-lg cursor-pointer transition-colors hover:opacity-80 ${
            systemStatus.database.status === 'connected' ? 'bg-green-50' :
            systemStatus.database.status === 'error' ? 'bg-red-50' : 'bg-yellow-50'
          }`} onClick={checkDatabase}>
            <h3 className={`text-xs sm:text-sm font-medium ${
              systemStatus.database.status === 'connected' ? 'text-green-800' :
              systemStatus.database.status === 'error' ? 'text-red-800' : 'text-yellow-800'
            }`}>🗄️ Database</h3>
            <p className={`text-lg sm:text-2xl font-bold ${
              systemStatus.database.status === 'connected' ? 'text-green-900' :
              systemStatus.database.status === 'error' ? 'text-red-900' : 'text-yellow-900'
            }`}>
              {systemStatus.database.status}
            </p>
            {systemStatus.database.lastCheck && (
              <p className="text-xs text-gray-500 mt-1">Last: {systemStatus.database.lastCheck}</p>
            )}
          </div>
          
          <div className={`p-3 sm:p-4 rounded-lg cursor-pointer transition-colors hover:opacity-80 ${
            systemStatus.mqtt.status === 'connected' ? 'bg-green-50' :
            systemStatus.mqtt.status === 'error' ? 'bg-red-50' : 'bg-yellow-50'
          }`} onClick={checkMQTT}>
            <h3 className={`text-xs sm:text-sm font-medium ${
              systemStatus.mqtt.status === 'connected' ? 'text-green-800' :
              systemStatus.mqtt.status === 'error' ? 'text-red-800' : 'text-yellow-800'
            }`}>📡 MQTT</h3>
            <p className={`text-lg sm:text-2xl font-bold ${
              systemStatus.mqtt.status === 'connected' ? 'text-green-900' :
              systemStatus.mqtt.status === 'error' ? 'text-red-900' : 'text-yellow-900'
            }`}>
              {systemStatus.mqtt.status}
            </p>
            {systemStatus.mqtt.lastCheck && (
              <p className="text-xs text-gray-500 mt-1">Last: {systemStatus.mqtt.lastCheck}</p>
            )}
          </div>
          
          <div className={`p-3 sm:p-4 rounded-lg cursor-pointer transition-colors hover:opacity-80 ${
            systemStatus.sse.status === 'connected' ? 'bg-green-50' :
            systemStatus.sse.status === 'error' ? 'bg-red-50' : 'bg-yellow-50'
          }`} onClick={checkSSE}>
            <h3 className={`text-xs sm:text-sm font-medium ${
              systemStatus.sse.status === 'connected' ? 'text-green-800' :
              systemStatus.sse.status === 'error' ? 'text-red-800' : 'text-yellow-800'
            }`}>🔌 SSE</h3>
            <p className={`text-lg sm:text-2xl font-bold ${
              systemStatus.sse.status === 'connected' ? 'text-green-900' :
              systemStatus.sse.status === 'error' ? 'text-red-900' : 'text-yellow-900'
            }`}>
              {systemStatus.sse.status}
            </p>
            {systemStatus.sse.lastCheck && (
              <p className="text-xs text-gray-500 mt-1">Last: {systemStatus.sse.lastCheck}</p>
            )}
          </div>
          
          <div className={`p-3 sm:p-4 rounded-lg cursor-pointer transition-colors hover:opacity-80 ${
            systemStatus.api.status === 'connected' ? 'bg-green-50' :
            systemStatus.api.status === 'error' ? 'bg-red-50' : 'bg-yellow-50'
          }`} onClick={checkAPI}>
            <h3 className={`text-xs sm:text-sm font-medium ${
              systemStatus.api.status === 'connected' ? 'text-green-800' :
              systemStatus.api.status === 'error' ? 'text-red-800' : 'text-yellow-800'
            }`}>🌐 API</h3>
            <p className={`text-lg sm:text-2xl font-bold ${
              systemStatus.api.status === 'connected' ? 'text-green-900' :
              systemStatus.api.status === 'error' ? 'text-red-900' : 'text-yellow-900'
            }`}>
              {systemStatus.api.status}
            </p>
            {systemStatus.api.lastCheck && (
              <p className="text-xs text-gray-500 mt-1">Last: {systemStatus.api.lastCheck}</p>
            )}
          </div>
        </div>
      </div>

      {/* API Testing Section */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">🧪 API Endpoint Testing</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select API Endpoint</h3>
            
            <select
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm text-gray-900 font-medium"
              value={selectedEndpoint}
              onChange={(e) => {
                const selected = apiEndpoints.find(ep => ep.endpoint === e.target.value);
                setSelectedEndpoint(e.target.value);
                if (selected) {
                  setRequestMethod(selected.method);
                  setRequestBody(selected.body || '');
                }
              }}
            >
              <option value="">Select an endpoint...</option>
              {Object.entries(groupedEndpoints).map(([category, endpoints]) => (
                <optgroup key={category} label={category}>
                  {endpoints.map((endpoint, index) => (
                    <option key={index} value={endpoint.endpoint}>
                      {endpoint.method} {endpoint.endpoint} - {endpoint.description}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {selectedEndpoint && (
              <div className="space-y-4 mt-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 rounded text-xs font-medium ${
                    requestMethod === 'GET' ? 'bg-green-100 text-green-800' :
                    requestMethod === 'POST' ? 'bg-blue-100 text-blue-800' :
                    requestMethod === 'PUT' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {requestMethod}
                  </span>
                  <span className="text-gray-900 font-mono text-sm">{selectedEndpoint}</span>
                </div>

                {(requestMethod === 'POST' || requestMethod === 'PUT') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Request Body (JSON)</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900"
                      rows={8}
                      placeholder="Enter JSON request body..."
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Headers (JSON)</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900"
                    rows={3}
                    value={requestHeaders}
                    onChange={(e) => setRequestHeaders(e.target.value)}
                  />
                </div>

                <button
                  className={`w-full py-3 px-4 rounded-md font-medium text-white ${
                    isLoading || !selectedEndpoint 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } flex items-center justify-center space-x-2`}
                  disabled={isLoading || !selectedEndpoint}
                  onClick={handleTestApi}
                >
                  <span>🧪</span>
                  <span>{isLoading ? 'Testing...' : 'Test API'}</span>
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Response</h3>
              {responseTime > 0 && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {responseTime}ms
                </span>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-auto border">
              {response ? (
                <div>
                  {response.error ? (
                    <div className="text-red-700 font-medium">
                      <strong>Error:</strong> {response.message}
                    </div>
                  ) : (
                    <div>
                      <span className={`inline-block px-3 py-1 rounded text-xs font-medium mb-3 ${
                        response.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        Status: {response.status} {response.statusText}
                      </span>
                      
                      <div className="mb-4">
                        <strong className="text-gray-900">Headers:</strong>
                        <pre className="text-xs bg-white p-3 rounded mt-2 overflow-auto border font-mono text-gray-700">
                          {JSON.stringify(response.headers, null, 2)}
                        </pre>
                      </div>
                      
                      <div>
                        <strong className="text-gray-900">Body:</strong>
                        <pre className="text-xs bg-white p-3 rounded mt-2 overflow-auto border font-mono text-gray-700">
                          {typeof response.data === 'string'
                            ? response.data
                            : JSON.stringify(response.data, null, 2)
                          }
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-600 text-center">
                  Select an endpoint and click &quot;Test API&quot; to see the response
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MQTT Topic Monitoring Section */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">📡 MQTT Topic Monitor</h2>
          <div className="flex items-center space-x-4">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              mqttConnectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
              mqttConnectionStatus === 'disconnected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {mqttConnectionStatus}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              {totalMqttMessages} messages
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
              {Object.keys(mqttTopics).length} topics
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Department</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm text-gray-900 font-medium"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                <option value="all">🌐 All Departments</option>
                {getUniqueDepartments().map(dept => (
                  <option key={dept} value={dept}>
                    {getDepartmentIcon(dept)} {dept.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Topics</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                placeholder="Search topic names..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-2 rounded text-xs font-medium ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setViewMode('grid')}
                >
                  📊 Grid
                </button>
                <button
                  className={`px-3 py-2 rounded text-xs font-medium ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setViewMode('list')}
                >
                  📋 List
                </button>
                <button
                  className={`px-3 py-2 rounded text-xs font-medium ${
                    viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setViewMode('table')}
                >
                  📊 Table
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Topics Display */}
        {Object.keys(getFilteredTopics()).length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-lg font-medium text-gray-700">
              🔍 {Object.keys(mqttTopics).length === 0 ? 'Waiting for MQTT messages...' : 'No topics match your filter'}
            </p>
            <p className="text-sm mt-2 text-gray-600">
              {Object.keys(mqttTopics).length === 0 
                ? 'Send test data or check SSE connection' 
                : 'Try adjusting your search or department filter'
              }
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(getFilteredTopics()).map(([topicKey, topicData]) => {
                  const department = getDepartmentFromTopic(topicKey);
                  return (
                    <div key={topicKey} className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getDepartmentIcon(department)}</span>
                          <h4 className="text-sm font-medium text-gray-900 truncate" title={topicKey}>
                            {getDeviceIdFromTopic(topicKey)}
                          </h4>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {topicData?.count || 0}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-3">
                        <div>📍 {department.replace('_', ' ')}</div>
                        <div>🕒 {topicData?.timestamp ? new Date(topicData.timestamp).toLocaleTimeString() : 'Unknown'}</div>
                      </div>
                      <div className="bg-white rounded p-3 max-h-32 overflow-y-auto border">
                        <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                          {topicData?.data ? JSON.stringify(topicData.data, null, 2) : 'No data available'}
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-4">
                {Object.entries(getFilteredTopics()).map(([topicKey, topicData]) => {
                  const department = getDepartmentFromTopic(topicKey);
                  
                  // Determine status based on last update time
                  const lastUpdate = topicData?.timestamp || new Date().toISOString();
                  const now = new Date().getTime();
                  const updateTime = new Date(lastUpdate).getTime();
                  const isOnline = (now - updateTime) <= 60000; // 1 minute timeout
                  const status = isOnline ? 'online' : 'offline';
                  
                  return (
                    <div key={topicKey} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getDepartmentIcon(department)}</span>
                          <div>
                            <h4 className="text-base font-medium text-gray-900" title={topicKey}>
                              {getDeviceIdFromTopic(topicKey)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              📍 {department.replace('_', ' ')} • 🕒 {topicData?.timestamp ? new Date(topicData.timestamp).toLocaleTimeString() : 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {topicData?.count || 0} messages
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            status === 'online' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {status}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white rounded p-3 border">
                        <details className="cursor-pointer">
                          <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
                            📊 Latest Data
                          </summary>
                          <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono mt-2 max-h-48 overflow-y-auto">
                            {topicData?.data ? JSON.stringify(topicData.data, null, 2) : 'No data available'}
                          </pre>
                        </details>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === 'table' && (
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Device
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Messages
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Update
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Key Metrics
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(getFilteredTopics()).map(([topicKey, topicData]) => {
                        const department = getDepartmentFromTopic(topicKey);
                        const deviceId = getDeviceIdFromTopic(topicKey);
                        
                        // Determine status based on last update time
                        const lastUpdate = topicData?.timestamp || new Date().toISOString();
                        const now = new Date().getTime();
                        const updateTime = new Date(lastUpdate).getTime();
                        const isOnline = (now - updateTime) <= 60000; // 1 minute timeout
                        const status = isOnline ? 'online' : 'offline';
                        
                        const energyData = topicData?.data?.energy_data;
                        const envData = topicData?.data?.environmental_data;
                        
                        return (
                          <tr key={topicKey} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-lg mr-2">{getDepartmentIcon(department)}</span>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{deviceId}</div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs" title={topicKey}>
                                    {topicKey}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">
                                {department.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                status === 'online' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {topicData?.count || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {topicData?.timestamp ? new Date(topicData.timestamp).toLocaleString() : 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="space-y-1">
                                {energyData && (
                                  <div className="flex space-x-4">
                                    {energyData.voltage && (
                                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                        ⚡ {energyData.voltage}V
                                      </span>
                                    )}
                                    {energyData.active_power && (
                                      <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                                        🔋 {energyData.active_power.toFixed(1)}W
                                      </span>
                                    )}
                                  </div>
                                )}
                                {envData && envData.temperature && (
                                  <div className="flex space-x-4">
                                    <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">
                                      🌡️ {envData.temperature}°C
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        <div className="bg-blue-50 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-medium text-blue-900 mb-4">📋 MQTT Topic Patterns</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-800">
            <div className="space-y-1">
              <div className="font-medium">� Data Topics:</div>
              <div>�🔧 devices/engineering/+/datas</div>
              <div>🏛️ devices/institution/+/datas</div>
              <div>📚 devices/liberal_arts/+/datas</div>
              <div>💼 devices/business_administration/+/datas</div>
              <div>🏗️ devices/architecture/+/datas</div>
              <div>⚙️ devices/industrial_education/+/datas</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">⚙️ Property Topics:</div>
              <div>🔧 devices/engineering/+/prop</div>
              <div>🏛️ devices/institution/+/prop</div>
              <div>📚 devices/liberal_arts/+/prop</div>
              <div>💼 devices/business_administration/+/prop</div>
              <div>🏗️ devices/architecture/+/prop</div>
              <div>⚙️ devices/industrial_education/+/prop</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}