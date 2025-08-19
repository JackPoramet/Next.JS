// SSE Service สำหรับจัดการ Server-Sent Events
import type { SSEMessage } from '../types/sse';

// เก็บ SSE connections ที่ active
const activeConnections = new Set<ReadableStreamDefaultController>();
let connectionCounter = 0;

// Rate limiting สำหรับป้องกัน rapid connections
const connectionRateLimit = new Map<string, { count: number, firstConnection: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 นาที
const MAX_CONNECTIONS_PER_MINUTE = 10;

// ฟังก์ชันสำหรับส่งข้อความผ่าน SSE
export function sendSSEMessage(controller: ReadableStreamDefaultController, message: SSEMessage) {
  try {
    // ตรวจสอบสถานะ controller ก่อนส่งข้อมูล
    if (!controller || controller.desiredSize === null) {
      console.warn('⚠️ Controller is closed or invalid, removing from connections');
      activeConnections.delete(controller);
      return false;
    }
    
    const encoder = new TextEncoder();
    const data = `data: ${JSON.stringify(message)}\n\n`;
    controller.enqueue(encoder.encode(data));
    return true;
  } catch (error) {
    console.error('❌ Error sending SSE message:', error);
    // ลบ controller ที่เสียจาก Set
    activeConnections.delete(controller);
    return false;
  }
}

// ฟังก์ชันสำหรับ broadcast ข้อมูลไปยัง SSE clients ทั้งหมด
export function broadcastToSSE(topic: string, data: any) {
  const message: SSEMessage = {
    type: 'data',
    topic, 
    data, 
    timestamp: new Date().toISOString(),
    broadcast_time: new Date().toLocaleTimeString(),
    totalConnections: activeConnections.size
  };
  
  // Debug: Log broadcast attempt
  console.log(`📡 Starting SSE broadcast for topic: ${topic}`);
  console.log(`📊 Active SSE connections: ${activeConnections.size}`);
  console.log(`📋 Message to broadcast:`, JSON.stringify(message, null, 2));
  
  let successCount = 0;
  let errorCount = 0;
  
  // สร้าง array copy เพื่อหลีกเลี่ยง concurrent modification
  const connectionsArray = Array.from(activeConnections);
  
  connectionsArray.forEach(controller => {
    try {
      // ตรวจสอบ controller ก่อนส่ง
      if (controller && controller.desiredSize !== null) {
        if (sendSSEMessage(controller, message)) {
          successCount++;
        } else {
          errorCount++;
        }
      } else {
        // ลบ controller ที่ไม่ active
        activeConnections.delete(controller);
        errorCount++;
      }
    } catch (error) {
      console.error('❌ Error broadcasting to SSE client:', error);
      activeConnections.delete(controller);
      errorCount++;
    }
  });
  
  // Log broadcast statistics
  if (activeConnections.size > 0) {
    console.log(`📡 SSE Broadcast to ${successCount}/${activeConnections.size} clients | Topic: ${topic}`);
    if (errorCount > 0) {
      console.log(`⚠️ ${errorCount} SSE clients failed to receive broadcast`);
    }
  }
}

// ฟังก์ชันสำหรับเพิ่ม connection
export function addSSEConnection(controller: ReadableStreamDefaultController, clientIP?: string): number {
  connectionCounter++;
  
  // Rate limiting check
  if (clientIP) {
    const now = Date.now();
    const clientRateInfo = connectionRateLimit.get(clientIP);
    
    if (clientRateInfo) {
      // Reset counter if window expired
      if (now - clientRateInfo.firstConnection > RATE_LIMIT_WINDOW) {
        connectionRateLimit.set(clientIP, { count: 1, firstConnection: now });
      } else {
        clientRateInfo.count++;
        if (clientRateInfo.count > MAX_CONNECTIONS_PER_MINUTE) {
          console.warn(`⚠️ Rate limit exceeded for IP ${clientIP}: ${clientRateInfo.count} connections in 1 minute`);
          // ยังคงให้เชื่อมต่อได้ แต่ log warning
        }
      }
    } else {
      connectionRateLimit.set(clientIP, { count: 1, firstConnection: now });
    }
    
    // Cleanup old rate limit entries
    for (const [ip, info] of connectionRateLimit.entries()) {
      if (now - info.firstConnection > RATE_LIMIT_WINDOW) {
        connectionRateLimit.delete(ip);
      }
    }
  }
  
  activeConnections.add(controller);
  console.log(`👥 Added SSE connection #${connectionCounter}. Total: ${activeConnections.size}`);
  return connectionCounter;
}

// ฟังก์ชันสำหรับลบ connection
export function removeSSEConnection(controller: ReadableStreamDefaultController): void {
  const wasActive = activeConnections.has(controller);
  activeConnections.delete(controller);
  
  if (wasActive) {
    console.log(`👥 Removed SSE connection. Remaining: ${activeConnections.size}`);
  }
  
  // Periodic cleanup ของ dead connections
  if (activeConnections.size > 0) {
    setTimeout(() => cleanupDeadConnections(), 1000);
  }
}

// ฟังก์ชันสำหรับทำความสะอาด connections ที่ตายแล้ว
function cleanupDeadConnections() {
  let cleaned = 0;
  const connectionsArray = Array.from(activeConnections);
  
  connectionsArray.forEach(controller => {
    try {
      // ตรวจสอบว่า controller ยังใช้งานได้หรือไม่
      if (controller.desiredSize === null) {
        activeConnections.delete(controller);
        cleaned++;
      }
    } catch (error) {
      // Controller เสียหาย ลบออก
      activeConnections.delete(controller);
      cleaned++;
    }
  });
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} dead SSE connections. Active: ${activeConnections.size}`);
  }
}

// ฟังก์ชันสำหรับดู status ของ connections (แบบละเอียด)
export function getSSEConnectionStats() {
  const stats = {
    totalConnections: activeConnections.size,
    connectionCounter: connectionCounter,
    serverStatus: 'running' as const,
    healthyConnections: 0,
    brokenConnections: 0,
    connections: [] as Array<{
      status: 'healthy' | 'broken',
      desiredSize: number | null
    }>
  };
  
  activeConnections.forEach(controller => {
    try {
      const isHealthy = controller.desiredSize !== null;
      const connectionInfo = {
        status: isHealthy ? 'healthy' as const : 'broken' as const,
        desiredSize: controller.desiredSize
      };
      
      stats.connections.push(connectionInfo);
      
      if (isHealthy) {
        stats.healthyConnections++;
      } else {
        stats.brokenConnections++;
      }
    } catch (error) {
      stats.brokenConnections++;
      stats.connections.push({
        status: 'broken',
        desiredSize: null
      });
    }
  });
  
  return stats;
}

// ฟังก์ชันสำหรับส่ง heartbeat ไปยัง clients ทั้งหมด
export function sendHeartbeatToAll() {
  const heartbeatMessage: SSEMessage = {
    type: 'heartbeat',
    timestamp: new Date().toISOString(),
    totalConnections: activeConnections.size
  };
  
  const connectionsArray = Array.from(activeConnections);
  let successCount = 0;
  let errorCount = 0;
  
  connectionsArray.forEach(controller => {
    try {
      if (controller && controller.desiredSize !== null) {
        if (sendSSEMessage(controller, heartbeatMessage)) {
          successCount++;
        } else {
          errorCount++;
        }
      } else {
        activeConnections.delete(controller);
        errorCount++;
      }
    } catch (error) {
      console.error('❌ Error sending heartbeat:', error);
      activeConnections.delete(controller);
      errorCount++;
    }
  });
  
  if (errorCount > 0) {
    console.log(`⚠️ Heartbeat: ${successCount} success, ${errorCount} failed (cleaned up dead connections)`);
  }
}

// ฟังก์ชันสำหรับส่งข้อความสถิติ
export function sendStatsToAll() {
  const statsMessage: SSEMessage = {
    type: 'stats',
    timestamp: new Date().toISOString(),
    totalConnections: activeConnections.size,
    connectionCounter: connectionCounter,
    serverStatus: 'running'
  };
  
  const connectionsArray = Array.from(activeConnections);
  connectionsArray.forEach(controller => {
    try {
      sendSSEMessage(controller, statsMessage);
    } catch (error) {
      console.error('❌ Error sending stats:', error);
      activeConnections.delete(controller);
    }
  });
}

export default {
  sendSSEMessage,
  broadcastToSSE,
  addSSEConnection,
  removeSSEConnection,
  getSSEConnectionStats,
  sendHeartbeatToAll,
  sendStatsToAll
};
