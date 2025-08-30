import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/devices/data - ดึงข้อมูลล่าสุดจากตาราง devices_data
export async function GET(_request: NextRequest) {
  try {
    // ดึงข้อมูลล่าสุดจากตาราง devices_data
    const result = await query(
      `SELECT d.*, dp.device_name, dp.device_id, f.faculty_name as faculty
       FROM devices_data d
       JOIN devices_prop dp ON d.device_id = dp.device_id
       LEFT JOIN locations l ON dp.location_id = l.id
       LEFT JOIN faculties f ON l.faculty_id = f.id
       ORDER BY d.last_data_received DESC`,
      []
    );

    // แปลงข้อมูลให้เหมาะสมกับการแสดงผล
    const devicesData = result.rows.map((row: Record<string, unknown>) => ({
      ...row,
      last_data_received: row.last_data_received ? new Date(row.last_data_received as string).toISOString() : null,
      created_at: row.created_at ? new Date(row.created_at as string).toISOString() : null,
      updated_at: row.updated_at ? new Date(row.updated_at as string).toISOString() : null
    }));

    // จัดกลุ่มข้อมูลตามคณะ
    const devicesByFaculty: { [faculty: string]: { [deviceKey: string]: Record<string, unknown> } } = {};
    
    devicesData.forEach((device: Record<string, unknown>) => {
      const faculty = (device.faculty as string) || 'unknown';
      const deviceKey = (device.device_name as string) || (device.device_id as string);
      
      if (!devicesByFaculty[faculty]) {
        devicesByFaculty[faculty] = {};
      }
      
      devicesByFaculty[faculty][deviceKey] = {
        energy_data: {
          voltage: device.voltage ? parseFloat(device.voltage as string) : null,
          current: device.current_amperage ? parseFloat(device.current_amperage as string) : null,
          active_power: device.active_power ? parseFloat(device.active_power as string) : null,
          frequency: device.frequency ? parseFloat(device.frequency as string) : null,
          power_factor: device.power_factor ? parseFloat(device.power_factor as string) : null,
          // ข้อมูลเพิ่มเติมสำหรับระบบไฟฟ้า 3 เฟส
          voltage_phase_b: device.voltage_phase_b ? parseFloat(device.voltage_phase_b as string) : null,
          voltage_phase_c: device.voltage_phase_c ? parseFloat(device.voltage_phase_c as string) : null,
          current_phase_b: device.current_phase_b ? parseFloat(device.current_phase_b as string) : null,
          current_phase_c: device.current_phase_c ? parseFloat(device.current_phase_c as string) : null,
          power_factor_phase_b: device.power_factor_phase_b ? parseFloat(device.power_factor_phase_b as string) : null,
          power_factor_phase_c: device.power_factor_phase_c ? parseFloat(device.power_factor_phase_c as string) : null,
          active_power_phase_a: device.active_power_phase_a ? parseFloat(device.active_power_phase_a as string) : null,
          active_power_phase_b: device.active_power_phase_b ? parseFloat(device.active_power_phase_b as string) : null,
          active_power_phase_c: device.active_power_phase_c ? parseFloat(device.active_power_phase_c as string) : null
        },
        environmental_data: {
          temperature: device.device_temperature ? parseFloat(device.device_temperature as string) : null
        },
        // ข้อมูลสถานะ
        network_status: device.network_status,
        connection_quality: device.connection_quality,
        signal_strength: device.signal_strength,
        // ข้อมูลเวลา
        lastUpdate: device.last_data_received,
        timestamp: device.updated_at
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Device data retrieved successfully',
      data: {
        devicesByFaculty,
        totalDevices: devicesData.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[ERROR] Devices Data API - Error:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error retrieving device data',
      data: {
        devicesByFaculty: {},
        totalDevices: 0,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}
