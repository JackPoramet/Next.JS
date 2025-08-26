import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

/**
 * GET /api/admin/pending-devices
 * ดึงรายการอุปกรณ์ที่รอการอนุมัติ
 */
export async function GET(request: NextRequest) {
  try {
    // ดึงรายการอุปกรณ์ที่รอการอนุมัติ
    const result = await query(`
      SELECT 
        id,
        device_id,
        device_name,
        device_type,
        ip_address,
        mac_address,
        firmware_version,
        connection_type,
        approval_status_id,
        mqtt_data,
        discovered_at,
        last_seen_at,
        discovery_source
      FROM devices_pending 
      ORDER BY discovered_at DESC
    `);

    return NextResponse.json({
      success: true,
      devices: result.rows
    });

  } catch (error) {
    console.error('Error fetching pending devices:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pending-devices
 * เพิ่มอุปกรณ์ใหม่ที่รอการอนุมัติ (จาก MQTT)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      device_id,
      device_name,
      device_prop,
      mqtt_topic,
      raw_mqtt_data
    } = body;

    // ตรวจสอบว่ามี device_id นี้แล้วหรือไม่
    const existing = await query(
      'SELECT device_id FROM devices_pending WHERE device_id = $1',
      [device_id]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Device already exists in pending list'
      });
    }

    // บันทึกข้อมูลอุปกรณ์ใหม่
    await query(`
      INSERT INTO devices_pending (
        device_id,
        device_name,
        device_type,
        ip_address,
        mac_address,
        firmware_version,
        connection_type,
        mqtt_data,
        discovered_at,
        approval_status_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      device_id,
      device_name || 'Unnamed Device',
      device_prop?.device_type || 'unknown',
      device_prop?.ip_address || null,
      device_prop?.mac_address || null,
      device_prop?.firmware_version || null,
      device_prop?.connection_type || 'wifi',
      JSON.stringify(body),
      new Date().toISOString(),
      1 // pending status
    ]);

    return NextResponse.json({
      success: true,
      message: 'Device added to pending list'
    });

  } catch (error) {
    console.error('Error adding pending device:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
