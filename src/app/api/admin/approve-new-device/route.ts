import { NextRequest, NextResponse } from 'next/server';
import { query, pool } from '@/lib/database';

// POST /api/admin/approve-new-device - อนุมัติอุปกรณ์ใหม่
export async function POST(request: NextRequest) {
  try {
    console.log('[INFO] New Device Approval API - Processing approval');
    
    const body = await request.json();
    const {
      device_id,
      device_name,
      faculty,
      building,
      floor,
      room,
      position,
      meter_model_id,
      admin_notes
    } = body;
    
    // Validate required fields
    if (!device_id || !device_name || !faculty || !meter_model_id) {
      return NextResponse.json({
        success: false,
        message: 'กรุณาระบุข้อมูลที่จำเป็น: device_id, device_name, faculty, meter_model_id'
      }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // ตรวจสอบว่า device_id นี้มีอยู่แล้วหรือไม่ (ทั้ง devices_prop และ devices_data)
      const existingDevice = await client.query(
        'SELECT device_id FROM devices_prop WHERE device_id = $1',
        [device_id]
      );
      
      const existingDeviceData = await client.query(
        'SELECT device_id FROM devices_data WHERE device_id = $1',
        [device_id]
      );
      
      if (existingDevice.rows.length > 0 || existingDeviceData.rows.length > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({
          success: false,
          message: 'อุปกรณ์นี้มีอยู่ในระบบแล้ว'
        }, { status: 400 });
      }
      
      // ตรวจสอบว่า meter_model_id มีอยู่หรือไม่
      const meterModel = await client.query(
        'SELECT * FROM meter_prop WHERE meter_model_id = $1',
        [meter_model_id]
      );
      
      if (meterModel.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({
          success: false,
          message: 'รุ่นมิเตอร์ที่ระบุไม่มีในระบบ'
        }, { status: 400 });
      }
      
      // 1. เพิ่มอุปกรณ์ในตาราง devices_prop
      const insertDeviceQuery = `
        INSERT INTO devices_prop (
          device_id,
          device_name,
          meter_model_id,
          faculty,
          building,
          floor,
          room,
          position,
          status,
          is_enabled,
          notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', true, $9)
        RETURNING *
      `;
      
      const deviceResult = await client.query(insertDeviceQuery, [
        device_id,
        device_name,
        meter_model_id,
        faculty,
        building,
        floor,
        room,
        position,
        `อนุมัติจากอุปกรณ์ใหม่ที่ตรวจพบ. ${admin_notes || ''}`
      ]);
      
      // 2. สร้าง entry เริ่มต้นในตาราง devices_data
      const insertDataQuery = `
        INSERT INTO devices_data (
          device_id,
          network_status,
          voltage,
          current_amperage,
          power_factor,
          frequency,
          active_power,
          reactive_power,
          apparent_power,
          device_temperature
        ) VALUES ($1, 'offline', 0, 0, 0.95, 50, 0, 0, 0, 25)
        RETURNING *
      `;
      
      const dataResult = await client.query(insertDataQuery, [device_id]);
      
      await client.query('COMMIT');
      
      console.log(`[INFO] Successfully approved new device: ${device_id}`);
      
      return NextResponse.json({
        success: true,
        message: 'อนุมัติอุปกรณ์ใหม่เรียบร้อยแล้ว',
        data: {
          device: deviceResult.rows[0],
          device_data: dataResult.rows[0]
        }
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('[ERROR] New Device Approval API - Error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอนุมัติอุปกรณ์',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/admin/approve-new-device - ดึงรายการ meters ที่ว่างสำหรับ dropdown
export async function GET() {
  try {
    const availableMetersQuery = `
      SELECT 
        mp.meter_id,
        mp.model_name,
        m.name AS manufacturer,
        mp.meter_type,
        ps.power_phase,
        ps.rated_voltage,
        ps.rated_current,
        ps.rated_power,
        CASE 
          WHEN dp.meter_id IS NOT NULL THEN false
          ELSE true
        END AS available
      FROM meter_prop mp
      JOIN manufacturers m ON mp.manufacturer_id = m.id
      JOIN power_specifications ps ON mp.power_spec_id = ps.id
      LEFT JOIN devices_prop dp ON mp.meter_id = dp.meter_id
      WHERE dp.meter_id IS NULL  -- เฉพาะ meters ที่ยังไม่ได้ใช้
      ORDER BY mp.model_name, mp.meter_id
    `;
    
    const result = await query(availableMetersQuery);
    
    return NextResponse.json({
      success: true,
      data: {
        available_meters: result.rows
      }
    });
    
  } catch (error) {
    console.error('[ERROR] Get Available Meters API - Error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลมิเตอร์ที่ว่าง',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
