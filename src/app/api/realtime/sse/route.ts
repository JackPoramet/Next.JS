import { NextRequest } from 'next/server';
import { query } from '@/lib/db';

interface DeviceData {
  device_id: string;
  device_name?: string;
  faculty_name?: string;
  network_status: string;
  voltage?: number;
  current_amperage?: number;
  active_power?: number;
  power_factor?: number;
  frequency?: number;
  device_temperature?: number;
  total_energy?: number;
  daily_energy?: number;
  updated_at: string;
}

// เก็บ connections ที่ active
const connections = new Set<ReadableStreamDefaultController>();
// เก็บ heartbeat interval ต่อ connection โดยไม่รั่วหน่วยความจำ
const heartbeats = new WeakMap<ReadableStreamDefaultController, NodeJS.Timeout>();

// ฟังก์ชันส่งข้อมูลไปยัง clients ทั้งหมด
function broadcastToClients(data: any) {
  const encoder = new TextEncoder();
  const message = `data: ${JSON.stringify(data)}\n\n`;
  const payload = encoder.encode(message);

  // ส่งข้อมูลไปยัง clients ทั้งหมด และลบ connections ที่ปิดแล้ว
  const connectionsToRemove: ReadableStreamDefaultController[] = [];

  connections.forEach((controller) => {
    try {
      controller.enqueue(payload);
    } catch (error) {
      // controller ถูกปิดไปแล้ว หรืออยู่ในสถานะที่ enqueue ไม่ได้
      console.error('SSE enqueue failed; marking controller for removal', error);
      connectionsToRemove.push(controller);
    }
  });

  // ลบ connections ที่มีปัญหา และหยุด heartbeat ของมัน
  connectionsToRemove.forEach((controller) => {
    connections.delete(controller);
    const hb = heartbeats.get(controller);
    if (hb) clearInterval(hb);
    heartbeats.delete(controller);
  });

  if (connectionsToRemove.length > 0) {
    console.log(`🧹 Cleaned up ${connectionsToRemove.length} dead SSE connections. Active: ${connections.size}`);
  }
}

// ฟังก์ชันดึงข้อมูลล่าสุดจากฐานข้อมูล
async function fetchLatestDeviceData(): Promise<DeviceData[]> {
  try {
    const deviceQuery = `
      SELECT 
        dd.device_id,
        dp.device_name,
        f.faculty_name,
        dd.network_status,
        dd.voltage,
        dd.current_amperage,
        dd.active_power,
        dd.power_factor,
        dd.frequency,
        dd.device_temperature,
        dd.total_energy,
        dd.daily_energy,
        dd.updated_at
      FROM devices_data dd
      INNER JOIN devices_prop dp ON dd.device_id = dp.device_id
      LEFT JOIN locations l ON dp.location_id = l.id
      LEFT JOIN faculties f ON l.faculty_id = f.id
      ORDER BY dd.updated_at DESC
    `;

    const result = await query(deviceQuery, []);
    return result.rows as DeviceData[];
  } catch (error) {
    console.error('❌ Error fetching device data:', error);
    return [];
  }
}

// ฟังก์ชันส่งข้อมูลเริ่มต้นให้ client ใหม่
async function sendInitialData(controller: ReadableStreamDefaultController) {
  try {
    const devices = await fetchLatestDeviceData();
    
    // ส่งข้อมูลเริ่มต้น
    const initialData = {
      type: 'initial',
      data: devices,
      timestamp: new Date().toISOString()
    };
    
    const message = `data: ${JSON.stringify(initialData)}\n\n`;
    controller.enqueue(new TextEncoder().encode(message));
  } catch (error) {
    console.error('❌ Error sending initial data:', error);
  }
}

// ส่งข้อมูลอัปเดตตามช่วงเวลา
let intervalId: NodeJS.Timeout | null = null;

function startPeriodicUpdates() {
  if (intervalId) return; // ถ้ามี interval อยู่แล้วไม่ต้องสร้างใหม่
  
  intervalId = setInterval(async () => {
    if (connections.size === 0) {
      // ถ้าไม่มี connection หยุด interval
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log('⏹️ Stopped periodic updates - no active connections');
      }
      return;
    }
    
    try {
      const devices = await fetchLatestDeviceData();
      
      // ส่งข้อมูลอัปเดต
      const updateData = {
        type: 'update',
        data: devices,
        timestamp: new Date().toISOString()
      };
      
      console.log(`📡 Broadcasting update to ${connections.size} connections`);
      broadcastToClients(updateData);
    } catch (error) {
      console.error('❌ Error in periodic update:', error);
    }
  }, 5000); // อัปเดตทุก 5 วินาที
  
  console.log('🔄 Started periodic updates every 5 seconds');
}

export async function GET(request: NextRequest) {
  console.log('📡 New SSE connection request');
  
  let controllerRef: ReadableStreamDefaultController | null = null;

  const cleanup = () => {
    if (!controllerRef) return;
    // ลบ connection เมื่อปิด และหยุด heartbeat
    connections.delete(controllerRef);
    const hb = heartbeats.get(controllerRef);
    if (hb) clearInterval(hb);
    heartbeats.delete(controllerRef);
    controllerRef = null;
    console.log(`👥 Remaining SSE connections: ${connections.size}`);
  };

  const stream = new ReadableStream({
    start(controller) {
      console.log('✅ SSE connection established');
      
      // เพิ่ม connection ใหม่
      controllerRef = controller;
      connections.add(controller);
      console.log(`👥 Total SSE connections: ${connections.size}`);
      
      // ส่งข้อมูลเริ่มต้น
      sendInitialData(controller);
      
      // เริ่ม periodic updates
      startPeriodicUpdates();
      
      // ส่ง heartbeat
      const heartbeatInterval = setInterval(() => {
        try {
          if (controllerRef && connections.has(controllerRef)) {
            const heartbeat = `data: ${JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString(),
              connections: connections.size
            })}\n\n`;
            
            controller.enqueue(new TextEncoder().encode(heartbeat));
          } else {
            // Connection ถูกลบแล้ว หยุด heartbeat
            clearInterval(heartbeatInterval);
            console.log('💔 Heartbeat stopped - connection removed');
          }
        } catch (error) {
          console.error('❌ Error sending heartbeat:', error);
          clearInterval(heartbeatInterval);
          if (controllerRef) connections.delete(controllerRef);
        }
      }, 30000); // ส่ง heartbeat ทุก 30 วินาที
      
      // เก็บ heartbeat เพื่อนำไปเคลียร์ตอนปิด
      heartbeats.set(controller, heartbeatInterval);

      // ผูกการ cleanup กับการยกเลิก request ของ client
      try {
        request.signal.addEventListener('abort', () => {
          console.log('� Request aborted by client');
          cleanup();
        }, { once: true });
      } catch {
        // ignore if signal not available
      }
    },
    
    cancel() {
      console.log('� SSE connection closed');
      cleanup();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// Note: In Next.js App Router, route files should only export HTTP methods (GET/POST/etc.).
// If you need to trigger SSE broadcasts from elsewhere (e.g., MQTT), extract a notifier
// into a shared module and import it there to call broadcastToClients.
