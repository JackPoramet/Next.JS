import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

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

// GET /api/devices - Get all devices
export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG] Devices API - Getting all devices from database');

    // ดึงข้อมูล devices จากฐานข้อมูล
    const query = `
      SELECT 
        id,
        name,
        device_id,
        faculty,
        building,
        floor,
        room,
        position,
        meter_type,
        device_model,
        manufacturer,
        status,
        network_status,
        ip_address,
        installation_date,
        last_maintenance,
        current_reading,
        voltage,
        current_amperage,
        power_factor,
        last_data_received,
        description,
        notes,
        created_at,
        updated_at
      FROM iot_devices 
      ORDER BY faculty, name
    `;

    const result = await pool.query(query);
    const devices: Device[] = result.rows.map(row => ({
      ...row,
      created_at: row.created_at?.toISOString() || new Date().toISOString(),
      updated_at: row.updated_at?.toISOString() || new Date().toISOString(),
      installation_date: row.installation_date?.toISOString()?.split('T')[0],
      last_maintenance: row.last_maintenance?.toISOString()?.split('T')[0],
      last_data_received: row.last_data_received?.toISOString(),
      ip_address: row.ip_address?.toString()
    }));

    // คำนวณสถิติ
    const stats = {
      totalDevices: devices.length,
      activeDevices: devices.filter(d => d.status === 'active').length,
      digitalMeters: devices.filter(d => d.meter_type === 'digital').length,
      analogMeters: devices.filter(d => d.meter_type === 'analog').length,
      onlineDevices: devices.filter(d => d.network_status === 'online').length,
      offlineDevices: devices.filter(d => d.network_status === 'offline').length
    };

    console.log(`[DEBUG] Devices API - Retrieved ${devices.length} devices from database`);

    return NextResponse.json({
      success: true,
      message: 'Devices retrieved successfully',
      data: {
        devices,
        stats
      }
    });

  } catch (error) {
    console.error('[ERROR] Devices API - Error getting devices:', error);
    
    // ถ้าตารางยังไม่มี ให้สร้างก่อน
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.log('[INFO] Devices table does not exist, will need to run migration');
      return NextResponse.json({
        success: false,
        message: 'Devices table not found. Please run database migration first.',
        error: 'Table iot_devices does not exist'
      }, { status: 500 });
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to retrieve devices',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/devices - Create new device
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      device_id, 
      faculty, 
      building, 
      floor, 
      room, 
      position, 
      meter_type, 
      device_model, 
      manufacturer, 
      status, 
      ip_address, 
      installation_date, 
      description 
    } = body;

    console.log('[DEBUG] Devices API - Creating new device:', { name, faculty, meter_type, status });

    // Basic validation
    if (!name || !faculty || !meter_type) {
      return NextResponse.json(
        { success: false, message: 'Name, faculty, and meter_type are required' },
        { status: 400 }
      );
    }

    // เพิ่ม device ใหม่ในฐานข้อมูล
    const query = `
      INSERT INTO iot_devices (
        name, device_id, faculty, building, floor, room, position,
        meter_type, device_model, manufacturer, status, ip_address, 
        installation_date, description
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) RETURNING *
    `;

    const values = [
      name,
      device_id || `DEV_${Date.now()}`, // สร้าง device_id อัตโนมัติถ้าไม่มี
      faculty,
      building,
      floor,
      room,
      position,
      meter_type,
      device_model,
      manufacturer,
      status || 'active',
      ip_address,
      installation_date || null,
      description
    ];

    const result = await pool.query(query, values);
    const newDevice = result.rows[0];

    // แปลงวันที่เป็น ISO string
    const deviceResponse: Device = {
      ...newDevice,
      created_at: newDevice.created_at?.toISOString() || new Date().toISOString(),
      updated_at: newDevice.updated_at?.toISOString() || new Date().toISOString(),
      installation_date: newDevice.installation_date?.toISOString()?.split('T')[0],
      ip_address: newDevice.ip_address?.toString()
    };

    console.log('[DEBUG] Devices API - Device created successfully:', deviceResponse.id);

    return NextResponse.json({
      success: true,
      message: 'Device created successfully',
      data: deviceResponse
    });

  } catch (error) {
    console.error('[ERROR] Devices API - Error creating device:', error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Device ID already exists',
          error: 'Duplicate device_id'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create device',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
