'use client';

import { useEffect, useState } from 'react';

export default function WebSocketTestPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [wsInstance, setWsInstance] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Initialize WebSocket Server
    fetch('/api/websocket')
      .then(res => res.json())
      .then(data => {
        console.log('🚀 WebSocket Server Status:', data);
      })
      .catch(err => {
        console.error('❌ Failed to initialize WebSocket server:', err);
      });

    // Connect to WebSocket
    const wsUrl = 'ws://localhost:8080';
    console.log('🔗 Connecting to WebSocket:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    setWsInstance(ws);
    
    ws.onopen = () => {
      console.log('✅ WebSocket connected!');
      setConnectionStatus('connected');
      
      // Send test message
      ws.send(JSON.stringify({
        type: 'test',
        message: 'Hello from frontend test',
        timestamp: new Date().toISOString()
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('📥 Received WebSocket message:', message);
        setMessages(prev => [message, ...prev.slice(0, 9)]); // Keep last 10 messages
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
        setMessages(prev => [{ raw: event.data, timestamp: new Date().toISOString() }, ...prev.slice(0, 9)]);
      }
    };
    
    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setConnectionStatus('disconnected');
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setConnectionStatus('disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendTestMessage = () => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      const testMessage = {
        type: 'manual_test',
        message: `Test message at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date().toISOString()
      };
      
      wsInstance.send(JSON.stringify(testMessage));
      console.log('📤 Sent test message:', testMessage);
    } else {
      console.log('❌ WebSocket not connected');
    }
  };

  const testMQTT = async () => {
    try {
      const response = await fetch('/api/start-services');
      const data = await response.json();
      console.log('🧪 MQTT Test Response:', data);
    } catch (error) {
      console.error('❌ MQTT test failed:', error);
    }
  };

  const testBroadcast = async () => {
    try {
      const response = await fetch('/api/test-broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_id: 'TEST_001',
          topic: 'devices/engineering/TEST_001'
        })
      });
      const data = await response.json();
      console.log('📡 Test Broadcast Response:', data);
    } catch (error) {
      console.error('❌ Test broadcast failed:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">WebSocket Test Page</h1>
      
      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="font-medium">{connectionStatus}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        <div className="flex gap-4">
          <button
            onClick={sendTestMessage}
            disabled={connectionStatus !== 'connected'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Send Test Message
          </button>
          <button
            onClick={testMQTT}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Test MQTT
          </button>
          <button
            onClick={testBroadcast}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Test Broadcast
          </button>
        </div>
      </div>

      {/* Messages Log */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Messages Log ({messages.length})</h2>
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages received yet...</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className="border border-gray-200 rounded p-3">
                <div className="text-sm text-gray-500 mb-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
                <pre className="text-sm bg-gray-50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(message, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• WebSocket URL: ws://localhost:8080</li>
          <li>• Check browser console for detailed logs</li>
          <li>• Make sure Next.js server is running</li>
          <li>• MQTT should connect to iot666.ddns.net:1883</li>
        </ul>
      </div>
    </div>
  );
}
