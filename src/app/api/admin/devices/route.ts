import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET /api/admin/devices - ดึงข้อมูลอุปกรณ์ทั้งหมดจาก devices_prop
export async function GET() {
  try {
    console.log('🔄 Fetching devices data...');
    
    // Enhanced query to get comprehensive devices info with all related data
    const result = await query(`
      SELECT 
        dp.id,
        dp.device_id,
        dp.device_name,
        dp.device_type,
        dp.status,
        dp.is_enabled,
        dp.ip_address,
        dp.mac_address,
        dp.connection_type,
        dp.data_collection_interval,
        dp.firmware_version,
        dp.created_at,
        dp.updated_at,
        -- Location information
        f.faculty_name,
        f.faculty_code,
        l.building,
        l.floor,
        l.room,
        -- Meter information
        mp.model_name as meter_model_name,
        m.name as manufacturer_name,
        -- Power specifications
        ps.rated_voltage,
        ps.rated_current,
        ps.rated_power,
        ps.power_phase,
        -- Latest device data
        dd.voltage,
        dd.current_amperage,
        dd.active_power,
        dd.total_energy,
        dd.network_status,
        dd.last_data_received,
        dd.device_temperature
      FROM devices_prop dp
      LEFT JOIN locations l ON dp.location_id = l.id
      LEFT JOIN faculties f ON l.faculty_id = f.id
      LEFT JOIN meter_prop mp ON dp.meter_id = mp.meter_id
      LEFT JOIN manufacturers m ON mp.manufacturer_id = m.id
      LEFT JOIN power_specifications ps ON mp.power_spec_id = ps.id
      LEFT JOIN devices_data dd ON dp.device_id = dd.device_id
      ORDER BY dp.created_at DESC
    `);
    
    console.log('✅ Query result rows:', result.rows.length);
    console.log('📋 Sample device:', result.rows[0]);

    // Calculate stats
    const devices = result.rows;
    console.log('📊 Processing devices for stats...');
    
    const stats = {
      totalDevices: devices.length,
      activeDevices: devices.filter(d => d.status === 'active').length,
      onlineDevices: devices.filter(d => d.network_status === 'online').length,
      offlineDevices: devices.filter(d => d.network_status === 'offline').length,
      enabledDevices: devices.filter(d => d.is_enabled).length,
      devicesByFaculty: devices.reduce((acc, d) => {
        acc[d.faculty_name || 'Unknown'] = (acc[d.faculty_name || 'Unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      devicesByType: devices.reduce((acc, d) => {
        acc[d.device_type || 'Unknown'] = (acc[d.device_type || 'Unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      devicesByMeterType: devices.reduce((acc, d) => {
        acc[d.meter_type || 'Unknown'] = (acc[d.meter_type || 'Unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    console.log('📈 Stats calculated:', stats);

    const responseData = {
      devices: devices.map(device => ({
        ...device,
        faculty: device.faculty_name, // Map faculty_name to faculty for compatibility
        meter_type: device.meter_type || 'digital',
        network_status: device.network_status || 'offline'
      })),
      stats
    };

    console.log('🚀 Sending response with', responseData.devices.length, 'devices');

    return NextResponse.json({
      success: true,
      message: 'ดึงข้อมูลอุปกรณ์สำเร็จ',
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching devices:', error);
    
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
