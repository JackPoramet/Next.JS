import { NextRequest, NextResponse } from 'next/server';

// GET /api/devices/properties - Get all device properties
export async function GET(_request: NextRequest) {
  try {
    console.log('[INFO] Device Properties API - Fetching device properties (device tables disabled)');

    // Return empty data since device tables are disabled
    return NextResponse.json({
      success: true,
      message: 'Device properties system disabled',
      data: {
        properties: []
      }
    });

  } catch (error) {
    console.error('[ERROR] Device Properties API - GET Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch device properties',
      data: {
        properties: []
      }
    }, { status: 500 });
  }
}

// PUT /api/devices/properties - Update device properties (disabled)
export async function PUT(request: NextRequest) {
  try {
    console.log('[INFO] Device Properties API - Update properties (device tables disabled)');

    // Parse request body for validation
    const _body = await request.json();
    
    return NextResponse.json({
      success: false,
      message: 'Device properties update disabled - device tables not available',
      data: null
    }, { status: 503 });

  } catch (error) {
    console.error('[ERROR] Device Properties API - PUT Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Device properties update not available',
      data: null
    }, { status: 500 });
  }
}

// POST /api/devices/properties - Create device properties (disabled)
export async function POST(request: NextRequest) {
  try {
    console.log('[INFO] Device Properties API - Create properties (device tables disabled)');

    // Parse request body for validation
    const _body = await request.json();
    
    return NextResponse.json({
      success: false,
      message: 'Device properties creation disabled - device tables not available',
      data: null
    }, { status: 503 });

  } catch (error) {
    console.error('[ERROR] Device Properties API - POST Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Device properties creation not available',
      data: null
    }, { status: 500 });
  }
}

// DELETE /api/devices/properties - Delete device properties (disabled)
export async function DELETE(_request: NextRequest) {
  try {
    console.log('[INFO] Device Properties API - Delete properties (device tables disabled)');
    
    return NextResponse.json({
      success: false,
      message: 'Device properties deletion disabled - device tables not available',
      data: null
    }, { status: 503 });

  } catch (error) {
    console.error('[ERROR] Device Properties API - DELETE Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Device properties deletion not available',
      data: null
    }, { status: 500 });
  }
}
