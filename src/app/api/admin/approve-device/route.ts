import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getMQTTService } from '@/lib/mqtt-service';

export async function POST(request: NextRequest) {
  try {
    await query('BEGIN');

    const body = await request.json();
    const {
      device_id,
      device_name,
      meter_id, // ใช้ meter_id แทน meter information ต่างๆ
      faculty_name,
      building,
      floor,
      room,
      responsible_person_id,
      admin_notes
    } = body;

    console.log('Approving device:', device_id);

    // 1. Get pending device
    const pendingDevice = await query(
      'SELECT * FROM devices_pending WHERE device_id = $1',
      [device_id]
    );

    if (pendingDevice.rows.length === 0) {
      await query('ROLLBACK');
      return NextResponse.json({
        success: false,
        message: 'Device not found in pending list'
      }, { status: 404 });
    }

    const pending = pendingDevice.rows[0];

    // 2. Validate meter exists
    const meterResult = await query(
      'SELECT meter_id FROM meter_prop WHERE meter_id = $1',
      [meter_id]
    );

    if (meterResult.rows.length === 0) {
      await query('ROLLBACK');
      return NextResponse.json({
        success: false,
        message: 'Selected meter not found'
      }, { status: 400 });
    }

    // 3. Find or create faculty
    let faculty_id;
    const facultyResult = await query(
      'SELECT id FROM faculties WHERE faculty_name = $1',
      [faculty_name]
    );

    if (facultyResult.rows.length > 0) {
      faculty_id = facultyResult.rows[0].id;
    } else {
      const newFacultyResult = await query(
        'INSERT INTO faculties (faculty_code, faculty_name) VALUES ($1, $2) RETURNING id',
        [faculty_name.toLowerCase().replace(/\s+/g, '_'), faculty_name]
      );
      faculty_id = newFacultyResult.rows[0].id;
    }

    // 4. Find or create location
    let location_id;
    const locationResult = await query(
      'SELECT id FROM locations WHERE faculty_id = $1 AND building = $2 AND floor = $3 AND room = $4',
      [faculty_id, building, floor, room]
    );

    if (locationResult.rows.length > 0) {
      location_id = locationResult.rows[0].id;
    } else {
      const newLocationResult = await query(
        'INSERT INTO locations (faculty_id, building, floor, room) VALUES ($1, $2, $3, $4) RETURNING id',
        [faculty_id, building, floor, room]
      );
      location_id = newLocationResult.rows[0].id;
    }

    // 5. Find or create device model (use basic info since we don't have manufacturer relationship anymore)
    let device_model_id;
    const deviceModelResult = await query(
      'SELECT id FROM device_models WHERE model_name = $1',
      [pending.device_type || 'Unknown IoT Device']
    );

    if (deviceModelResult.rows.length > 0) {
      device_model_id = deviceModelResult.rows[0].id;
    } else {
      // Get a default manufacturer ID (first one available)
      const defaultManufacturerResult = await query('SELECT id FROM manufacturers LIMIT 1');
      let defaultManufacturerId = 1; // fallback
      if (defaultManufacturerResult.rows.length > 0) {
        defaultManufacturerId = defaultManufacturerResult.rows[0].id;
      }
      
      const newDeviceModelResult = await query(
        'INSERT INTO device_models (model_name, manufacturer_id) VALUES ($1, $2) RETURNING id',
        [pending.device_type || 'Unknown IoT Device', defaultManufacturerId]
      );
      device_model_id = newDeviceModelResult.rows[0].id;
    }

    // 6. Insert device_prop
    await query(`
      INSERT INTO devices_prop (
        device_id, device_name, device_model_id, meter_id, location_id,
        install_date, ip_address, mac_address, connection_type,
        data_collection_interval, responsible_person_id, status, is_enabled,
        approval_status_id, device_type, firmware_version, mqtt_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `, [
      device_id,
      device_name || pending.device_name,
      device_model_id,
      meter_id,
      location_id,
      new Date().toISOString().split('T')[0],
      pending.ip_address,
      pending.mac_address,
      pending.connection_type || 'wifi',
      60,
      responsible_person_id ? parseInt(responsible_person_id) : null,
      'active',
      true,
      2,
      pending.device_type,
      pending.firmware_version,
      pending.mqtt_data
    ]);

    // 9. Delete from pending
    await query(
      'DELETE FROM devices_pending WHERE device_id = $1',
      [device_id]
    );

    // 10. Log approval history
    await query(`
      INSERT INTO device_approval_history (
        device_id, action, previous_status_id, new_status_id,
        performed_by_name, action_reason, action_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      device_id,
      'approved',
      1,
      2,
      'System Admin',
      admin_notes || 'Device approved via admin panel',
      JSON.stringify({
        approved_at: new Date().toISOString(),
        location_id,
        meter_id,
        device_model_id,
        responsible_person_id
      })
    ]);

    await query('COMMIT');

    // Optional MQTT config
    try {
      const mqttService = getMQTTService();
      
      // Get meter details for MQTT message
      const meterDetails = await query(`
        SELECT 
          mp.model_name,
          m.name as manufacturer_name,
          ps.rated_voltage,
          ps.rated_current,
          ps.rated_power,
          ps.power_phase
        FROM meter_prop mp
        JOIN manufacturers m ON mp.manufacturer_id = m.id
        JOIN power_specifications ps ON mp.power_spec_id = ps.id
        WHERE mp.meter_id = $1
      `, [meter_id]);
      
      const meter = meterDetails.rows[0];
      
      const configMessage = {
        device_id,
        approved: true,
        registration_datetime: new Date().toISOString(),
        meter_info: {
          meter_id: meter_id,
          meter_model_name: meter.model_name,
          meter_manufacturer: meter.manufacturer_name,
          rated_voltage: meter.rated_voltage,
          rated_current: meter.rated_current,
          rated_power: meter.rated_power,
          power_phase: meter.power_phase
        },
        location_info: {
          faculty_name,
          building,
          floor,
          room
        },
        admin_notes
      };
      
      const configTopic = `devices/engineering/${device_id}/config`;
      await mqttService.publish(configTopic, JSON.stringify(configMessage));
    } catch (mqttError) {
      console.warn('Failed to send MQTT config:', mqttError);
    }

    return NextResponse.json({
      success: true,
      message: 'Device approved successfully',
      data: {
        device_id,
        approved: true,
        location_id,
        meter_id
      }
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Error approving device:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to approve device: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
