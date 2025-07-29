import { WebSocketServer } from 'ws';
import { getMQTTService } from './mqtt-service';

let wss: WebSocketServer | null = null;

// สร้าง WebSocket Server
export function initializeWebSocketServer() {
  if (!wss) {
    const port = parseInt(process.env.WS_PORT || '8080');
    const host = process.env.WS_HOST || '0.0.0.0'; // รองรับ Docker
    
    wss = new WebSocketServer({ 
      port: port,
      host: host
    });
    
    console.log(`🚀 WebSocket Server starting on ${host}:${port}`);
    
    wss.on('connection', (ws) => {
      console.log('👤 New WebSocket client connected');
      console.log(`🔢 Total connected clients: ${wss?.clients.size}`);
      
      // ส่งข้อความต้อนรับ
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to IoT Energy WebSocket Server',
        timestamp: new Date().toISOString(),
        server_info: {
          mqtt_broker: 'iot666.ddns.net:1883',
          supported_topics: [
            'devices/institution/+',
            'devices/engineering/+', 
            'devices/liberal_arts/+',
            'devices/business_administration/+',
            'devices/architecture/+',
            'devices/industrial_education/+'
          ]
        }
      }));

      ws.on('message', (message) => {
        console.log('📨 Received from client:', message.toString());
      });

      ws.on('close', () => {
        console.log('👋 Client disconnected');
        console.log(`🔢 Remaining connected clients: ${wss?.clients.size}`);
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });
    });

    console.log(`🚀 WebSocket Server started on ${host}:${port}`);
    
    // เริ่มต้น MQTT Service
    const mqttService = getMQTTService();
  }
  
  return wss;
}

export function broadcastToWebSocket(topic: string, data: any) {
  if (!wss) {
    wss = initializeWebSocketServer();
  }
  
  const message = {
    topic, 
    data, 
    timestamp: new Date().toISOString(),
    broadcast_time: new Date().toLocaleTimeString()
  };
  
  let clientCount = 0;
  wss?.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(message));
      clientCount++;
    }
  });
  
  // Debug logs removed for cleaner console output
  // console.log(`📡 Broadcasting MQTT data to ${clientCount} clients`);
  // console.log(`📋 Topic: ${topic}`);
  // console.log(`📊 Data: ${JSON.stringify(data, null, 2)}`);
  // console.log('─'.repeat(60));
}

export function getWebSocketServer() {
  return wss;
}

export default { initializeWebSocketServer, broadcastToWebSocket, getWebSocketServer };
