import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

interface Device {
  id: number;
  name: string;
  faculty: string;
  meter_type: 'digital' | 'analog';
  status: 'active' | 'inactive';
  position?: string;
  updated_at: string;
  created_at: string;
}

// GET /api/devices/[id] - Get single device
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    console.log('[DEBUG] Devices API - Getting device:', id);

    // For now, return mock data
    const mockDevice: Device = {
      id: parseInt(id),
      name: `Smart Meter ${id.padStart(3, '0')}`,
      faculty: 'engineering',
      meter_type: 'digital',
      status: 'active',
      position: `Building A, Floor ${Math.ceil(parseInt(id) / 2)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Device retrieved successfully',
      data: mockDevice
    });

  } catch (error) {
    console.error('[ERROR] Devices API - Error getting device:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to retrieve device',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/devices/[id] - Update device
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, faculty, meter_type, status, position } = body;

    console.log('[DEBUG] Devices API - Updating device:', id, { name, faculty, meter_type, status });

    // Basic validation
    if (!name || !faculty || !meter_type) {
      return NextResponse.json(
        { success: false, message: 'Name, faculty, and meter_type are required' },
        { status: 400 }
      );
    }

    // For now, create mock updated device
    const updatedDevice: Device = {
      id: parseInt(id),
      name,
      faculty,
      meter_type,
      status: status || 'active',
      position,
      created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      updated_at: new Date().toISOString()
    };

    console.log('[DEBUG] Devices API - Device updated successfully:', updatedDevice.id);

    return NextResponse.json({
      success: true,
      message: 'Device updated successfully',
      data: updatedDevice
    });

  } catch (error) {
    console.error('[ERROR] Devices API - Error updating device:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update device',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/devices/[id] - Delete device
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    console.log('[DEBUG] Devices API - Deleting device:', id);

    // For now, just return success response
    console.log('[DEBUG] Devices API - Device deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Device deleted successfully'
    });

  } catch (error) {
    console.error('[ERROR] Devices API - Error deleting device:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete device',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
