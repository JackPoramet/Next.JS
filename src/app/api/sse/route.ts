import { NextRequest } from 'next/server';
import { getMQTTService } from '../../../lib/mqtt-service';
import { 
  addSSEConnection, 
  removeSSEConnection, 
  sendSSEMessage as sseServiceSendMessage,
  getSSEConnectionStats 
} from '../../../lib/sse-service';
import type { SSEMessage } from '../../../types/sse';

export async function GET(request: NextRequest) {
  try {
    // เริ่มต้น MQTT Service
    const mqttService = getMQTTService();

    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    console.log(`✅ New SSE connection request`);
    console.log(`📱 Client IP: ${clientIP}`);
    console.log(`🖥️ User Agent: ${userAgent?.substring(0, 50)}...`);

    // สร้าง ReadableStream สำหรับ SSE
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      start(controller) {
        // เพิ่ม connection เข้า service
        const connectionId = addSSEConnection(controller, clientIP);
        const stats = getSSEConnectionStats();
        
        console.log(`👥 Total active SSE connections: ${stats.totalConnections}`);

        // ส่งข้อความต้อนรับ
        const welcomeMessage: SSEMessage = {
          type: 'connection',
          message: 'Connected to IoT Energy SSE Server',
          timestamp: new Date().toISOString(),
          connectionId: connectionId,
          totalConnections: stats.totalConnections,
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
        };

        sseServiceSendMessage(controller, welcomeMessage);

        // ส่ง heartbeat ทุก 45 วินาที (เพิ่มขึ้นจาก 30 วินาที)
        const heartbeatInterval = setInterval(() => {
          try {
            // ตรวจสอบสถานะ controller ก่อนส่ง heartbeat
            if (controller.desiredSize === null) {
              console.log(`⚠️ Controller closed for connection #${connectionId}, stopping heartbeat`);
              clearInterval(heartbeatInterval);
              removeSSEConnection(controller);
              return;
            }
            
            const currentStats = getSSEConnectionStats();
            const heartbeatMessage: SSEMessage = {
              type: 'heartbeat',
              timestamp: new Date().toISOString(),
              connectionId: connectionId,
              totalConnections: currentStats.totalConnections
            };
            
            if (!sseServiceSendMessage(controller, heartbeatMessage)) {
              console.log(`❌ Failed to send heartbeat to connection #${connectionId}, stopping heartbeat`);
              clearInterval(heartbeatInterval);
              removeSSEConnection(controller);
            }
          } catch (error) {
            console.error(`❌ Error sending heartbeat to connection #${connectionId}:`, error);
            clearInterval(heartbeatInterval);
            removeSSEConnection(controller);
          }
        }, 45000);

        // Cleanup เมื่อ connection ปิด
        request.signal.addEventListener('abort', () => {
          console.log(`🔌 SSE connection #${connectionId} closed (abort signal)`);
          clearInterval(heartbeatInterval);
          removeSSEConnection(controller);
        });
        
        // เพิ่ม error handler สำหรับ controller
        const originalEnqueue = controller.enqueue.bind(controller);
        controller.enqueue = function(chunk) {
          try {
            if (controller.desiredSize !== null) {
              return originalEnqueue(chunk);
            }
          } catch (error) {
            console.error(`❌ Controller enqueue error for connection #${connectionId}:`, error);
            clearInterval(heartbeatInterval);
            removeSSEConnection(controller);
          }
        };
      },

      cancel(reason) {
        console.log(`🔌 SSE stream cancelled for connection, reason:`, reason);
        // หมายเหตุ: removeSSEConnection จะถูกเรียกจาก abort handler
      }
    });

    // Response headers สำหรับ SSE
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });

  } catch (error) {
    console.error('❌ SSE API Error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to initialize SSE connection',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
