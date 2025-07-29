'use client';

import { useEffect, useState } from 'react';

export default function WebSocketDebugPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // เริ่มต้น WebSocket Server ผ่าน API
    fetch('/api/websocket')
      .then(res => res.json())
      .then(data => console.log('WebSocket Server Status:', data));

    // กำหนด WebSocket URL ตาม environment
    const getWebSocketUrl = () => {
      if (typeof window !== 'undefined') {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const port = process.env.NODE_ENV === 'production' 
          ? window.location.port || (protocol === 'wss:' ? '443' : '80')
          : '8080';
        
        return `${protocol}//${host}:${port}`;
      }
      return 'ws://localhost:8080';
    };

    // เชื่อมต่อ WebSocket Client
    const wsUrl = getWebSocketUrl();
    console.log('🔗 Connecting to WebSocket:', wsUrl);
    const websocket = new WebSocket(wsUrl);
    setWs(websocket);
    
    websocket.onopen = () => {
      console.log('🔗 Connected to WebSocket');
      setConnectionStatus('connected');
    };
    
    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('📡 Raw WebSocket message:', message);
        
        setMessages(prev => [message, ...prev.slice(0, 49)]); // เก็บแค่ 50 รายการล่าสุด
        
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        setMessages(prev => [{
          error: true,
          rawData: event.data,
          timestamp: new Date().toISOString()
        }, ...prev.slice(0, 49)]);
      }
    };
    
    websocket.onclose = () => {
      console.log('❌ WebSocket disconnected');
      setConnectionStatus('disconnected');
    };
    
    websocket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setConnectionStatus('disconnected');
    };

    return () => {
      websocket.close();
    };
  }, []);

  const sendTestMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'test',
        message: 'Test from debug page',
        timestamp: new Date().toISOString()
      }));
    }
  };

  const testBroadcast = async () => {
    try {
      const response = await fetch('/api/test-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: 'DEBUG_TEST',
          topic: 'devices/engineering/DEBUG_TEST'
        })
      });
      const data = await response.json();
      console.log('📡 Test Broadcast Response:', data);
    } catch (error) {
      console.error('❌ Test broadcast failed:', error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          WebSocket Debug Monitor
        </h1>
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-600">
            Status: {connectionStatus} | Messages: {messages.length}
          </span>
          <button
            onClick={sendTestMessage}
            disabled={connectionStatus !== 'connected'}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
          >
            Send Test
          </button>
          <button
            onClick={testBroadcast}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
          >
            Test Broadcast
          </button>
        </div>
      </div>

      {/* Messages Display */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          📡 Raw WebSocket Messages
        </h2>
        
        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages received yet...</p>
              <p className="text-sm mt-2">Try clicking "Test Broadcast" to send test data</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div key={index} className="border-b border-gray-200 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">
                      #{messages.length - index} - {new Date(message.timestamp || message.data?.timestamp || Date.now()).toLocaleTimeString()}
                    </span>
                    {message.topic && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {message.topic}
                      </span>
                    )}
                  </div>
                  <pre className="text-xs text-gray-700 bg-white p-2 rounded overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(message, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-2xl font-bold text-blue-600">{messages.length}</div>
            <div className="text-sm text-blue-600">Total Messages</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-2xl font-bold text-green-600">
              {messages.filter(m => m.topic?.startsWith('devices/')).length}
            </div>
            <div className="text-sm text-green-600">Device Messages</div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="text-2xl font-bold text-purple-600">
              {messages.filter(m => m.type === 'connection').length}
            </div>
            <div className="text-sm text-purple-600">Connection Messages</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 mb-2">🔍 Debug Instructions:</h3>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. Check if WebSocket status shows "connected"</li>
          <li>2. Click "Test Broadcast" to send test data</li>
          <li>3. Verify messages appear in the list above</li>
          <li>4. Check browser console for additional logs</li>
          <li>5. If no messages: check if MQTT service is running</li>
        </ol>
      </div>
    </div>
  );
}
