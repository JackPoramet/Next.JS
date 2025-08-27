import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET /api/admin/devices - ดึงข้อมูลอุปกรณ์ทั้งหมดจาก devices_prop
export async function GET() {
  try {
    // Simple query first to test database connection
    console.log('Checking database connection...');
    
    // Check if devices_prop table exists
    const tableCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('devices_prop', 'devices_data', 'locations')
    `);
    
    console.log('Available tables:', tableCheck.rows);
    
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
        dp.responsible_person,
        dp.contact_info,
        dp.install_date,
        dp.firmware_version,
        dp.mqtt_data,
        dp.created_at,
        dp.updated_at,
        -- Location information (corrected structure)
        f.faculty_name as faculty,
        f.faculty_code,
        l.building,
        l.floor,
        l.room,
        -- Get the latest device data
        dd.voltage,
        dd.current_amperage,
        dd.active_power,
        dd.total_energy,
        dd.last_data_received,
        dd.network_status as device_network_status,
        dd.power_factor,
        dd.frequency as current_frequency,
        dd.device_temperature
      FROM devices_prop dp
      LEFT JOIN locations l ON dp.location_id = l.id
      LEFT JOIN faculties f ON l.faculty_id = f.id
      LEFT JOIN LATERAL (
        SELECT 
          voltage,
          current_amperage,
          active_power,
          total_energy,
          last_data_received,
          network_status,
          power_factor,
          frequency,
          device_temperature,
          updated_at
        FROM devices_data 
        WHERE device_id = dp.device_id 
        ORDER BY updated_at DESC 
        LIMIT 1
      ) dd ON true
      ORDER BY dp.created_at DESC
    `);
    
    console.log('Query result rows:', result.rows.length);

    // Transform the data to basic format
    const devices = result.rows.map(row => ({
      id: row.id,
      device_id: row.device_id,
      device_name: row.device_name,
      device_type: row.device_type || 'unknown',
      status: row.status || 'unknown',
      is_enabled: row.is_enabled || false,
      network_status: row.device_network_status || 'offline',
      
      // Location information (from the corrected query)
      faculty: row.faculty || 'Unknown',
      faculty_code: row.faculty_code,
      building: row.building,
      floor: row.floor,
      room: row.room,
      
      // Device information
      device_model_name: null,
      manufacturer_name: null,
      
      // Meter information
      meter_model_name: null,
      meter_type: 'digital' as const,
      
      // Current sensor data from devices_data
      current_voltage: row.voltage,
      current_current: row.current_amperage,
      current_power: row.active_power,
      current_energy_consumption: row.total_energy,
      last_data_received: row.last_data_received,
      
      // Timestamps
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    // Calculate basic statistics
    const stats = {
      totalDevices: devices.length,
      activeDevices: devices.filter(d => d.status === 'active').length,
      onlineDevices: devices.filter(d => d.network_status === 'online').length,
      offlineDevices: devices.filter(d => d.network_status === 'offline').length,
      enabledDevices: devices.filter(d => d.is_enabled === true).length,
      devicesByFaculty: devices.reduce((acc, device) => {
        const faculty = device.faculty;
        acc[faculty] = (acc[faculty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      devicesByType: devices.reduce((acc, device) => {
        const type = device.device_type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      devicesByMeterType: devices.reduce((acc, device) => {
        const meterType = device.meter_type;
        acc[meterType] = (acc[meterType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return NextResponse.json({
      success: true,
      message: 'ดึงข้อมูลอุปกรณ์สำเร็จ',
      data: {
        devices,
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching devices:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const developmentError = process.env.NODE_ENV === 'development' ? errorMessage : undefined;
    
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์',
      error: developmentError
    }, { status: 500 });
  }
}
