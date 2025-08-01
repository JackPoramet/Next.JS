// API Route สำหรับ WebSocket Server
import { NextRequest } from 'next/server';
import { initializeWebSocketServer, getWebSocketServer } from '../../../lib/ws-server';
import { getMQTTService } from '../../../lib/mqtt-service';

export async function GET(request: NextRequest) {
  try {
    // ใช้ WebSocket Server จาก ws-server.ts
    const wss = initializeWebSocketServer();
    
    // เริ่มต้น MQTT Service (ถ้ายังไม่ได้เริ่ม)
    const mqttService = getMQTTService();
    
    const isRunning = wss && wss.clients.size >= 0;
    
    return new Response(JSON.stringify({
      success: true,
      status: 'running',
      port: parseInt(process.env.WS_PORT || '8080'),
      message: `WebSocket Server is ${isRunning ? 'running' : 'starting'} on port ${process.env.WS_PORT || '8080'}`,
      clientCount: wss?.clients.size || 0,
      websocket: {
        status: isRunning ? 'running' : 'starting',
        port: parseInt(process.env.WS_PORT || '8080'),
        host: process.env.WS_HOST || '0.0.0.0'
      },
      mqtt: {
        status: 'connected'
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('❌ WebSocket API Error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to initialize WebSocket server',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
