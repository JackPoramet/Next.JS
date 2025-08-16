import { WebSocketServer } from 'ws';
import { getMQTTService } from './mqtt-service';

let wss: WebSocketServer | null = null;
const activeConnections = new Set<any>();
let connectionCounter = 0;

// สร้าง WebSocket Server
export function initializeWebSocketServer() {
  if (!wss) {
    const port = parseInt(process.env.WS_PORT || '8080');
    const host = process.env.WS_HOST || '0.0.0.0'; // รองรับ Docker
    
    wss = new WebSocketServer({ 
      port: port,
      host: host,
      // เพิ่มการตั้งค่าสำหรับ multiple connections
      maxPayload: 16 * 1024 * 1024, // 16MB
      perMessageDeflate: false, // ปิด compression เพื่อประสิทธิภาพ
      backlog: 100, // รองรับ pending connections มากขึ้น
      clientTracking: true, // ติดตาม client connections
    });
    
    console.log(`🌐 WebSocket Server started on ${host}:${port}`);
    // console.log(`📊 Server configuration:`, {
    //   maxPayload: '16MB',
    //   perMessageDeflate: false,
    //   backlog: 100,
    //   clientTracking: true
    // });
    
    wss.on('connection', (ws, request) => {
      connectionCounter++;
      const connectionId = connectionCounter;
      const _clientIP = request.socket.remoteAddress;
      const _userAgent = request.headers['user-agent'];
      
      // console.log(`✅ New WebSocket connection #${connectionId}`);
      // console.log(`📱 Client IP: ${clientIP}`);
      // console.log(`🖥️ User Agent: ${userAgent?.substring(0, 50)}...`);
      // console.log(`👥 Total active connections: ${activeConnections.size + 1}`);
      
      // เพิ่ม connection เข้า Set
      activeConnections.add(ws);
      (ws as any).connectionId = connectionId;
      (ws as any).connectedAt = new Date().toISOString();
      
      // ส่งข้อความต้อนรับ
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to IoT Energy WebSocket Server',
        timestamp: new Date().toISOString(),
        connectionId: connectionId,
        totalConnections: activeConnections.size,
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

      // ส่ง heartbeat ทุก 30 วินาที
      const heartbeatInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString(),
            connectionId: connectionId
          }));
        } else {
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          
          // Handle ping/pong for connection health (silent)
          if (data.type === 'ping') {
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString(),
              connectionId: connectionId,
              originalTimestamp: data.timestamp
            }));
          } else {
            // console.log(`📨 Message from connection #${connectionId}:`, data);
            // Broadcast other messages to all connected clients
            // console.log(`📢 Broadcasting message from connection #${connectionId} to ${activeConnections.size} clients`);
            activeConnections.forEach((connection) => {
              if (connection !== ws && connection.readyState === 1) {
                connection.send(JSON.stringify({
                  ...data,
                  fromConnection: connectionId,
                  timestamp: new Date().toISOString()
                }));
              }
            });
          }
        } catch (error) {
          console.error(`❌ Error parsing message from connection #${connectionId}:`, error);
        }
      });

      ws.on('close', (_code, _reason) => {
        // console.log(`🔌 WebSocket connection #${connectionId} closed`);
        // console.log(`📋 Close code: ${code}, reason: ${reason}`);
        activeConnections.delete(ws);
        clearInterval(heartbeatInterval);
        // console.log(`👥 Remaining connections: ${activeConnections.size}`);
      });

      ws.on('error', (error) => {
        console.error(`❌ WebSocket error on connection #${connectionId}:`, error);
        activeConnections.delete(ws);
      });
    });

    // Handle server errors
    wss.on('error', (error) => {
      console.error('❌ WebSocket Server error:', error);
    });
    
    // Handle server listening
    wss.on('listening', () => {
      // console.log(`🎯 WebSocket Server is listening and ready for connections`);
    });
    
    // console.log(`🚀 WebSocket Server initialized successfully`);
    
    // เริ่มต้น MQTT Service
    const _mqttService = getMQTTService();
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
  let successCount = 0;
  let errorCount = 0;
  
  // ใช้ activeConnections แทน wss.clients เพื่อความแม่นยำ
  activeConnections.forEach(client => {
    try {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify(message));
        clientCount++;
        successCount++;
      } else {
        // ลบ connection ที่ไม่ active
        activeConnections.delete(client);
      }
    } catch (error) {
      console.error(`❌ Error broadcasting to client:`, error);
      activeConnections.delete(client);
      errorCount++;
    }
  });
  
  // Log broadcast statistics
  if (clientCount > 0) {
    console.log(`� Broadcast to ${successCount}/${clientCount} clients | Topic: ${topic}`);
    if (errorCount > 0) {
      console.log(`⚠️ ${errorCount} clients failed to receive broadcast`);
    }
  }
}

export function getWebSocketServer() {
  return wss;
}

// เพิ่มฟังก์ชันสำหรับดูสถิติ connections
export function getConnectionStats() {
  return {
    totalConnections: activeConnections.size,
    serverStatus: wss ? 'running' : 'stopped',
    connectionCounter: connectionCounter,
    connections: Array.from(activeConnections).map((ws: any) => ({
      id: ws.connectionId,
      connectedAt: ws.connectedAt,
      readyState: ws.readyState
    }))
  };
}

export default { initializeWebSocketServer, broadcastToWebSocket, getWebSocketServer, getConnectionStats };
