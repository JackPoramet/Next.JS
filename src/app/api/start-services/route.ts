// เริ่มต้น SSE และ MQTT Service
import { getMQTTService } from '../../../lib/mqtt-service';
import { getSSEConnectionStats } from '../../../lib/sse-service';

export async function GET() {
  try {
    // เริ่มต้น MQTT Service
    const mqttService = getMQTTService();
    
    // ดึงสถิติ SSE connections
    const sseStats = getSSEConnectionStats();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Services started successfully',
      mqtt: {
        status: 'connected',
        broker: 'iot666.ddns.net:1883',
        message: 'Connected to iot666.ddns.net'
      },
      sse: {
        status: 'running',
        endpoint: '/api/sse',
        activeConnections: sseStats.totalConnections,
        message: 'SSE service is running'
      },
      services: {
        sse: 'Running on /api/sse',
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
