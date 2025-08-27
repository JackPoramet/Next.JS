// เช็คสถานะ SSE และ MQTT Service (Auto-started services)
import { getMQTTService } from '../../../lib/mqtt-service';
import { getSSEConnectionStats } from '../../../lib/sse-service';

export async function GET() {
  try {
    // เช็คสถานะ MQTT Service (ควรทำงานอัตโนมัติแล้ว)
    const mqttService = getMQTTService();
    const mqttStatus = mqttService.getConnectionStatus();
    
    // ดึงสถิติ SSE connections
    const sseStats = getSSEConnectionStats();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Services status checked (auto-started)',
      mqtt: {
        status: mqttStatus.mqtt ? 'connected' : 'connecting',
        broker: 'iot666.ddns.net:1883',
        message: mqttStatus.mqtt ? 'Connected to iot666.ddns.net' : 'Connecting to iot666.ddns.net...'
      },
      sse: {
        status: 'running',
        endpoint: '/api/sse',
        activeConnections: sseStats.totalConnections,
        message: 'SSE service is running'
      },
      services: {
        sse: 'Running on /api/sse',
        mqtt: mqttStatus.mqtt ? 'Connected to iot666.ddns.net' : 'Auto-starting...'
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
