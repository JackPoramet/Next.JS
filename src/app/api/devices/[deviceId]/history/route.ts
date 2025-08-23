import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { DeviceData } from '@/lib/deviceModels';

// API endpoint สำหรับดึงข้อมูลอุปกรณ์ปัจจุบัน (ไม่มี history แล้ว)
// GET /api/devices/[deviceId]/history - ส่งคืนข้อมูลปัจจุบันเท่านั้น
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;
    
    console.log(`[INFO] Device Current Data API - Getting current data for device ${deviceId}`);
    
    // Query ดึงข้อมูลปัจจุบันจาก devices_data
    const currentDataQuery = `
      SELECT * FROM devices_data
      WHERE device_id = $1
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    
    const result = await pool.query(currentDataQuery, [deviceId]);
    
    // ตรวจสอบว่าพบข้อมูลหรือไม่
    if (result.rowCount === 0) {
      return NextResponse.json({
        success: true,
        message: 'No data found for this device',
        data: null
      });
    }
    
    // แปลงผลลัพธ์เป็น DeviceData object
    const currentData: DeviceData = result.rows[0];

    console.log(`[INFO] Device Current Data API - Successfully retrieved data for device: ${deviceId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Current device data retrieved successfully',
      data: currentData
    });

  } catch (error) {
    console.error('[ERROR] Device Current Data API - Error getting device data:', error);
    
    // ถ้าตารางยังไม่มี ให้แจ้งเตือน
    if (error instanceof Error && error.message.includes('does not exist')) {
      return NextResponse.json({
        success: false,
        message: 'Devices history table not found. Please run database migration first.',
        error: 'Table devices_data does not exist'
      }, { status: 500 });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to retrieve device history',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
