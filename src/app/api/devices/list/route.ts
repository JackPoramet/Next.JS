import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { DeviceInfo, DevicesStats } from '@/lib/deviceModels';

// GET /api/devices/list - รายการอุปกรณ์ทั้งหมดแบบใหม่จากฐานข้อมูลที่ปรับปรุง
export async function GET(_request: NextRequest) {
  try {
    console.log('[INFO] Devices List API - Getting all devices from new database tables');

    // ดึงข้อมูลพื้นฐานของอุปกรณ์จาก devices_prop
    const query = `
      SELECT 
        dp.device_id,
        dp.device_name,
        dp.meter_model_id,
        mp.model_name,
        mp.manufacturer,
        mp.meter_type,
        dp.faculty,
        dp.building,
        dp.floor,
        dp.room,
        dp.position,
        dp.status,
        dd.network_status,
        dp.is_enabled,
        dd.voltage,
        dd.current_amperage,
        dd.power_factor,
        dd.frequency,
        dd.active_power,
        dd.device_temperature,
        dd.last_data_received,
        dp.created_at,
        dp.updated_at
      FROM devices_prop dp
      LEFT JOIN devices_data dd ON dp.device_id = dd.device_id
      LEFT JOIN meter_prop mp ON dp.meter_model_id = mp.meter_model_id
      ORDER BY dp.faculty, dp.device_name
    `;

    const result = await pool.query(query);
    
    // แปลงผลลัพธ์เป็น DeviceInfo objects
    const devices: DeviceInfo[] = result.rows.map(row => ({
      device_id: row.device_id,
      device_name: row.device_name,
      meter_model_id: row.meter_model_id,
      model_name: row.model_name,
      manufacturer: row.manufacturer,
      meter_type: row.meter_type,
      faculty: row.faculty,
      building: row.building,
      floor: row.floor,
      room: row.room,
      position: row.position,
      status: row.status,
      network_status: row.network_status,
      is_enabled: row.is_enabled,
      voltage: row.voltage,
      current_amperage: row.current_amperage,
      power_factor: row.power_factor,
      frequency: row.frequency,
      active_power: row.active_power,
      device_temperature: row.device_temperature,
      last_data_received: row.last_data_received,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    // คำนวณสถิติ
    const devicesByFaculty: {[faculty: string]: number} = {};
    const devicesByType: {[meterType: string]: number} = {};

    devices.forEach(device => {
      // Count by faculty
      if (device.faculty) {
        devicesByFaculty[device.faculty] = (devicesByFaculty[device.faculty] || 0) + 1;
      }
      
      // Count by meter type
      if (device.meter_type) {
        devicesByType[device.meter_type] = (devicesByType[device.meter_type] || 0) + 1;
      }
    });

    const stats: DevicesStats = {
      totalDevices: devices.length,
      activeDevices: devices.filter(d => d.status === 'active').length,
      onlineDevices: devices.filter(d => d.network_status === 'online').length,
      offlineDevices: devices.filter(d => d.network_status === 'offline').length,
      errorDevices: devices.filter(d => d.network_status === 'error').length,
      devicesByFaculty,
      devicesByType
    };

    console.log(`[INFO] Devices List API - Retrieved ${devices.length} devices from database`);

    return NextResponse.json({
      success: true,
      message: 'Devices retrieved successfully',
      data: {
        devices,
        stats
      }
    });

  } catch (error) {
    console.error('[ERROR] Devices List API - Error getting devices:', error);
    
    // ถ้าตารางยังไม่มี ให้แจ้งเตือน
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.log('[INFO] New devices tables do not exist, please run migration');
      return NextResponse.json({
        success: false,
        message: 'Device tables not found. Please run database migration first.',
        error: 'Tables devices_prop, devices_data or meter_prop do not exist'
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
