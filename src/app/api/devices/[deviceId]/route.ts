import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { DeviceInfo, DeviceData, MeterProp } from '@/lib/deviceModels';

// Dynamic route สำหรับดึงข้อมูลอุปกรณ์แต่ละรายการตาม device_id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;
    console.log(`[INFO] Device Detail API - Getting details for device: ${deviceId}`);

    // Query 1: ข้อมูลพื้นฐานและรายละเอียดอุปกรณ์จาก devices_prop และ meter_prop
    const deviceInfoQuery = `
      SELECT 
        dp.*,
        mp.*
      FROM devices_prop dp
      LEFT JOIN meter_prop mp ON dp.meter_model_id = mp.meter_model_id
      WHERE dp.device_id = $1
    `;
    
    // Query 2: ข้อมูลการวัดค่าล่าสุดจาก devices_data
    const deviceDataQuery = `
      SELECT * FROM devices_data
      WHERE device_id = $1
      ORDER BY updated_at DESC 
      LIMIT 1
    `;
    
    // ทำ queries พร้อมกันเพื่อความเร็ว
    const [infoResult, dataResult] = await Promise.all([
      pool.query(deviceInfoQuery, [deviceId]),
      pool.query(deviceDataQuery, [deviceId])
    ]);
    
    // ตรวจสอบว่าพบข้อมูลหรือไม่
    if (infoResult.rowCount === 0) {
      return NextResponse.json({
        success: false,
        message: `Device with ID ${deviceId} not found`,
      }, { status: 404 });
    }
    
    // แปลงข้อมูลให้อยู่ในรูปแบบที่ถูกต้อง
    const deviceInfo: DeviceInfo = {
      device_id: infoResult.rows[0].device_id,
      device_name: infoResult.rows[0].device_name,
      meter_model_id: infoResult.rows[0].meter_model_id,
      faculty: infoResult.rows[0].faculty,
      building: infoResult.rows[0].building,
      floor: infoResult.rows[0].floor,
      room: infoResult.rows[0].room,
      position: infoResult.rows[0].position,
      status: infoResult.rows[0].status,
      is_enabled: infoResult.rows[0].is_enabled,
      model_name: infoResult.rows[0].model_name,
      manufacturer: infoResult.rows[0].manufacturer,
      meter_type: infoResult.rows[0].meter_type,
      created_at: infoResult.rows[0].created_at,
      updated_at: infoResult.rows[0].updated_at
    };
    
    // ข้อมูลการวัดค่าล่าสุด (อาจเป็น null ถ้ายังไม่มีข้อมูล)
    const deviceData: DeviceData | null = dataResult?.rowCount && dataResult.rowCount > 0 ? dataResult.rows[0] : null;

    // ข้อมูลรุ่นมิเตอร์
    const meterProp: MeterProp | null = infoResult.rows[0].meter_model_id ? {
      meter_model_id: infoResult.rows[0].meter_model_id,
      model_name: infoResult.rows[0].model_name,
      manufacturer: infoResult.rows[0].manufacturer,
      meter_type: infoResult.rows[0].meter_type,
      power_phase: infoResult.rows[0].power_phase || 'single', // เพิ่มฟิลด์ power_phase และกำหนดค่าเริ่มต้นเป็น 'single'
      rated_voltage: infoResult.rows[0].rated_voltage,
      rated_current: infoResult.rows[0].rated_current,
      rated_power: infoResult.rows[0].rated_power,
      accuracy_class: infoResult.rows[0].accuracy_class,
      frequency: infoResult.rows[0].frequency,
      created_at: infoResult.rows[0].created_at,
      updated_at: infoResult.rows[0].updated_at
    } : null;

    console.log(`[INFO] Device Detail API - Successfully retrieved data for device: ${deviceId}`);

    return NextResponse.json({
      success: true,
      message: 'Device details retrieved successfully',
      data: {
        deviceInfo,
        deviceData,
        meterProp
      }
    });

  } catch (error) {
    console.error('[ERROR] Device Detail API - Error getting device details:', error);
    
    // ถ้าตารางยังไม่มี ให้แจ้งเตือน
    if (error instanceof Error && error.message.includes('does not exist')) {
      return NextResponse.json({
        success: false,
        message: 'Device tables not found. Please run database migration first.',
        error: 'Tables devices_prop, devices_data, or meter_prop do not exist'
      }, { status: 500 });
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to retrieve device details',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
