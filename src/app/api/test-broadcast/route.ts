import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create test MQTT data
    const testData = {
      device_id: body.device_id || 'TEST_DEVICE_001',
      timestamp: new Date().toISOString(),
      voltage: 220 + Math.random() * 10,
      current: 10 + Math.random() * 5,
      power: 2200 + Math.random() * 500,
      energy: Math.random() * 100,
      frequency: 50 + Math.random() * 0.1,
      power_factor: 0.9 + Math.random() * 0.1,
      temperature: 25 + Math.random() * 15,
      status: 'online'
    };
    
    const topic = body.topic || `devices/engineering/${testData.device_id}`;
    
    console.log('🧪 Broadcasting test data:', { topic, data: testData });
    
  // Broadcast to SSE clients (WebSocket removed)
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Test data sent successfully',
      topic: topic,
      data: testData
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Test broadcast error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to send test data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
