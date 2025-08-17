import { NextRequest } from 'next/server';
import { getSSEConnectionStats } from '../../../lib/sse-service';
import { getMQTTService } from '../../../lib/mqtt-service';

export async function GET(_request: NextRequest) {
  try {
    // เริ่มต้น MQTT Service (ถ้ายังไม่ได้เริ่ม)
    const mqttService = getMQTTService();
    
    // ดึงสถิติ SSE connections
    const connectionStats = getSSEConnectionStats();
    
    // สร้าง recommendations
    const recommendations = generateRecommendations(connectionStats);
    
    return new Response(JSON.stringify({
      success: true,
      status: 'running',
      message: 'SSE Server is running',
      timestamp: new Date().toISOString(),
      sse: {
        status: 'running',
        activeConnections: connectionStats.totalConnections,
        healthyConnections: connectionStats.healthyConnections,
        brokenConnections: connectionStats.brokenConnections,
        totalConnectionsEver: connectionStats.connectionCounter,
        serverStatus: connectionStats.serverStatus,
        connectionDetails: connectionStats.connections
      },
      mqtt: {
        status: 'connected'
      },
      recommendations: recommendations,
      connectionStats: connectionStats
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('❌ SSE Status API Error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to get SSE server status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function generateRecommendations(stats: any) {
  const recommendations = [];
  
  if (stats.brokenConnections > 0) {
    recommendations.push({
      type: 'warning',
      message: `Found ${stats.brokenConnections} broken connections that should be cleaned up`,
      action: 'Consider implementing automatic cleanup'
    });
  }
  
  if (stats.totalConnections > 10) {
    recommendations.push({
      type: 'warning', 
      message: `High connection count (${stats.totalConnections}). Check for connection leaks.`,
      action: 'Monitor browser tabs, hot reloads, and component mounting'
    });
  }
  
  if (stats.totalConnections === 0) {
    recommendations.push({
      type: 'info',
      message: 'No active connections. This is normal when no clients are connected.',
      action: 'None required'
    });
  }
  
  if (stats.healthyConnections === stats.totalConnections && stats.totalConnections > 0) {
    recommendations.push({
      type: 'success',
      message: 'All connections are healthy ✅',
      action: 'Continue monitoring'
    });
  }
  
  // เพิ่ม recommendation เกี่ยวกับจำนวน connections ที่เหมาะสม
  if (stats.totalConnections > 0 && stats.totalConnections <= 5) {
    recommendations.push({
      type: 'success',
      message: 'Connection count is within normal range',
      action: 'No action needed'
    });
  }
  
  return recommendations;
}
