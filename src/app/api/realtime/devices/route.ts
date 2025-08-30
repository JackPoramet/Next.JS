import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface DeviceData {
  id: number;
  device_id: string;
  network_status: string;
  connection_quality: number;
  signal_strength?: number;
  voltage?: number;
  current_amperage?: number;
  power_factor?: number;
  frequency?: number;
  voltage_phase_b?: number;
  voltage_phase_c?: number;
  current_phase_b?: number;
  current_phase_c?: number;
  power_factor_phase_b?: number;
  power_factor_phase_c?: number;
  active_power?: number;
  reactive_power?: number;
  apparent_power?: number;
  active_power_phase_a?: number;
  active_power_phase_b?: number;
  active_power_phase_c?: number;
  device_temperature?: number;
  total_energy?: number;
  daily_energy?: number;
  uptime_hours?: number;
  last_maintenance?: string;
  last_data_received?: string;
  data_collection_count?: number;
  last_error_code?: string;
  last_error_message?: string;
  last_error_time?: string;
  error_count_today?: number;
  created_at: string;
  updated_at: string;
}

interface DeviceWithProp extends DeviceData {
  device_name?: string;
  device_type?: string;
  faculty_name?: string;
  location?: string;
  installation_date?: string;
  meter_type?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const faculty = searchParams.get('faculty');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

  const whereConditions: string[] = [];
  const queryParams: (string | number)[] = [];
    let paramIndex = 1;

    // Filter by faculty if specified
    if (faculty && faculty !== 'all') {
      whereConditions.push(`f.faculty_name = $${paramIndex}`);
      queryParams.push(faculty);
      paramIndex++;
    }

    // Filter by status if specified
    if (status && status !== 'all') {
      whereConditions.push(`dd.network_status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const deviceQuery = `
      SELECT 
        dd.id,
        dd.device_id,
        dd.network_status,
        dd.connection_quality,
        dd.signal_strength,
        dd.voltage,
        dd.current_amperage,
        dd.power_factor,
        dd.frequency,
        dd.voltage_phase_b,
        dd.voltage_phase_c,
        dd.current_phase_b,
        dd.current_phase_c,
        dd.power_factor_phase_b,
        dd.power_factor_phase_c,
        dd.active_power,
        dd.reactive_power,
        dd.apparent_power,
        dd.active_power_phase_a,
        dd.active_power_phase_b,
        dd.active_power_phase_c,
        dd.device_temperature,
        dd.total_energy,
        dd.daily_energy,
        dd.uptime_hours,
        dd.last_maintenance,
        dd.last_data_received,
        dd.data_collection_count,
        dd.last_error_code,
        dd.last_error_message,
        dd.last_error_time,
        dd.error_count_today,
        dd.created_at,
        dd.updated_at,
        dp.device_name,
        dp.device_type,
        f.faculty_name,
        CONCAT(COALESCE(l.building, ''), 
               CASE WHEN l.floor IS NOT NULL THEN CONCAT(' ชั้น ', l.floor) ELSE '' END,
               CASE WHEN l.room IS NOT NULL THEN CONCAT(' ห้อง ', l.room) ELSE '' END) as location,
        dp.install_date as installation_date,
        mp.meter_type
      FROM devices_data dd
      INNER JOIN devices_prop dp ON dd.device_id = dp.device_id
      LEFT JOIN locations l ON dp.location_id = l.id
      LEFT JOIN faculties f ON l.faculty_id = f.id
      LEFT JOIN meter_prop mp ON dp.meter_id = mp.meter_id
      ${whereClause}
      ORDER BY dd.updated_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit.toString(), offset.toString());

    const result = await query(deviceQuery, queryParams);
    const devices = result.rows as DeviceWithProp[];

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM devices_data dd
      INNER JOIN devices_prop dp ON dd.device_id = dp.device_id
      ${whereClause}
    `;

    const countResult = await query(countQuery, queryParams.slice(0, -2));
    const totalCount = parseInt(countResult.rows[0].total);

    // Group devices by faculty
    const devicesByFaculty: { [key: string]: DeviceWithProp[] } = {};
    devices.forEach(device => {
      const facultyKey = device.faculty_name || 'unknown';
      if (!devicesByFaculty[facultyKey]) {
        devicesByFaculty[facultyKey] = [];
      }
      devicesByFaculty[facultyKey].push(device);
    });

    // Calculate statistics
    const stats = {
      totalDevices: totalCount,
      onlineDevices: devices.filter(d => d.network_status === 'online').length,
      offlineDevices: devices.filter(d => d.network_status === 'offline').length,
      facultyCount: Object.keys(devicesByFaculty).length,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: {
        devices,
        devicesByFaculty,
        stats,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching devices data:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch devices data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST method for updating device data (for testing purposes)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { device_id, ...updateData } = body;

    if (!device_id) {
      return NextResponse.json(
        { success: false, message: 'device_id is required' },
        { status: 400 }
      );
    }

    // Build dynamic update query
    const updateFields = Object.keys(updateData).filter(key => 
      updateData[key] !== undefined && updateData[key] !== null
    );
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fields to update' },
        { status: 400 }
      );
    }

    const setClause = updateFields.map((field, index) => 
      `${field} = $${index + 2}`
    ).join(', ');

    const updateQuery = `
      UPDATE devices_data 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE device_id = $1
      RETURNING *
    `;

    const queryParams = [device_id, ...updateFields.map(field => updateData[field])];
    const result = await query(updateQuery, queryParams);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Device not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Device data updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating device data:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update device data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
