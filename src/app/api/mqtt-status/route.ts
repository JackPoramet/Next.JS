import { NextRequest } from 'next/server';
import { getMQTTService } from '../../../lib/mqtt-service';

export async function GET(_request: NextRequest) {
  try {
    const mqttService = getMQTTService();
    const status = mqttService.getConnectionStatus();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'MQTT service status retrieved',
      status: {
        mqtt_connected: status.mqtt,
        service_initialized: status.initialized,
        broker: 'iot666.ddns.net:1883',
        username: 'electric_energy',
        subscribed_topics: [
          'devices/institution/+',
          'devices/engineering/+', 
          'devices/liberal_arts/+',
          'devices/business_administration/+',
          'devices/architecture/+',
          'devices/industrial_education/+',
          'iot/alerts/+',
          'iot/system/status'
        ],
        last_check: new Date().toISOString()
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ MQTT Status Error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to get MQTT status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
