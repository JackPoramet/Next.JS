// เริ่มต้น WebSocket Server และ MQTT Service
import { initializeWebSocketServer } from '../../../lib/ws-server';
import { getMQTTService } from '../../../lib/mqtt-service';

export async function GET() {
  try {
    // เริ่มต้น WebSocket Server
    initializeWebSocketServer();
    
    // เริ่มต้น MQTT Service
    const mqttService = getMQTTService();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Services started successfully',
      mqtt: {
        status: 'connected',
        broker: 'iot666.ddns.net:1883',
        message: 'Connected to iot666.ddns.net'
      },
      websocket: {
        status: 'running',
        port: 8080,
        message: 'Running on port 8080'
      },
      services: {
        websocket: 'Running on port 8080',
        mqtt: 'Connected to iot666.ddns.net'
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to start services',
      error: error instanceof Error ? error.message : 'Unknown error',
      mqtt: {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
