import { NextRequest, NextResponse } from 'next/server';

export interface Device {
  id: number;
  name: string;
  device_id?: string;
  faculty: string;
  building?: string;
  floor?: string;
  room?: string;
  position?: string;
  meter_type: 'digital' | 'analog';
  device_model?: string;
  manufacturer?: string;
  status: 'active' | 'inactive' | 'maintenance';
  network_status?: 'online' | 'offline' | 'error';
  ip_address?: string;
  installation_date?: string;
  last_maintenance?: string;
  current_reading?: number;
  voltage?: number;
  current_amperage?: number;
  power_factor?: number;
  last_data_received?: string;
  description?: string;
  notes?: string;
  updated_at: string;
  created_at: string;
}

// GET /api/devices - Get all devices (disabled)
export async function GET(_request: NextRequest) {
  try {
    console.log('[DEBUG] Devices API - Device system disabled');

    return NextResponse.json({
      success: true,
      message: 'Device system disabled',
      devices: []
    });

  } catch (error) {
    console.error('[ERROR] Devices API - Error:', error);
    return NextResponse.json({
      success: true,
      message: 'Device system disabled',
      devices: []
    });
  }
}

// POST /api/devices - Create new device (disabled)
export async function POST(_request: NextRequest) {
  try {
    console.log('[DEBUG] Devices API - Device creation disabled');

    return NextResponse.json({
      success: false,
      message: 'Device creation disabled'
    }, { status: 501 });

  } catch (error) {
    console.error('[ERROR] Devices API - Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Device creation disabled'
    }, { status: 501 });
  }
}
