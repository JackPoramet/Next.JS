import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getMQTTService } from '@/lib/mqtt-service';

/**
 * POST /api/admin/approve-device
 * อนุมัติอุปกรณ์และย้ายจาก pending ไปยัง devices_prop และตารางอื่นๆ
 */
export async function POST(request: NextRequest) {
  const client = await query('BEGIN');
  
  try {
    const body = await request.json();
    const {
      device_id,
      device_name,
      device_prop,
      // Meter information
      meter_model_name,
      meter_manufacturer,
      rated_voltage,
      rated_current,
      rated_power,
      power_phase,
      // Location information
      faculty_name,
      building,
      floor,
      room,
      // Administrative information
      responsible_person,
      contact_info,
      admin_notes
    } = body;

    console.log('Approving device:', device_id);

    // 1. ดึงข้อมูลจาก devices_pending
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

    // 2. Insert ข้อมูลลงในตารางต่างๆ ตาม devices.sql schema

    // 2.1 Insert faculty
    const facultyResult = await query(`
      INSERT INTO faculties (faculty_name) 
      VALUES ($1) 
      ON CONFLICT (faculty_name) DO UPDATE SET faculty_name = EXCLUDED.faculty_name
      RETURNING faculty_id
    `, [faculty_name]);
    const faculty_id = facultyResult.rows[0].faculty_id;

    // 2.2 Insert building
    const buildingResult = await query(`
      INSERT INTO buildings (building_name, faculty_id) 
      VALUES ($1, $2)
      ON CONFLICT (building_name, faculty_id) DO UPDATE SET building_name = EXCLUDED.building_name
      RETURNING building_id
    `, [building, faculty_id]);
    const building_id = buildingResult.rows[0].building_id;

    // 2.3 Insert location
    const locationResult = await query(`
      INSERT INTO locations (building_id, floor, room) 
      VALUES ($1, $2, $3)
      ON CONFLICT (building_id, floor, room) DO UPDATE SET room = EXCLUDED.room
      RETURNING location_id
    `, [building_id, floor || null, room || null]);
    const location_id = locationResult.rows[0].location_id;

    // 2.4 Insert device_model
    const deviceModelResult = await query(`
      INSERT INTO device_models (model_name, manufacturer, device_type, firmware_version) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (model_name, manufacturer) DO UPDATE SET 
        device_type = EXCLUDED.device_type,
        firmware_version = EXCLUDED.firmware_version
      RETURNING id
    `, [meter_model_name, meter_manufacturer, pending.device_type || 'digital_meter', pending.firmware_version]);
    const device_model_id = deviceModelResult.rows[0].id;

    // 2.5 Insert meter_prop  
    const meterResult = await query(`
      INSERT INTO meter_prop (meter_type, rated_voltage, rated_current, rated_power, power_phase, meter_model_id) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING meter_id
    `, ['digital', rated_voltage, rated_current, rated_power, power_phase, device_model_id]);
    const meter_id = meterResult.rows[0].meter_id;

    // 2.6 Insert device_prop
    await query(`
      INSERT INTO devices_prop (
        device_id, device_name, device_model_id, meter_id, location_id,
        install_date, ip_address, mac_address, connection_type,
        data_collection_interval, responsible_person, contact_info, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      device_id,
      device_name || pending.device_name,
      device_model_id,
      meter_id,
      location_id,
      new Date().toISOString().split('T')[0], // install_date
      pending.ip_address,
      pending.mac_address,
      pending.connection_type || 'wifi',
      60, // default data_collection_interval
      responsible_person,
      contact_info,
      'active' // status
    ]);

    // 3. ลบออกจาก devices_pending
    await query(
      'DELETE FROM devices_pending WHERE device_id = $1',
      [device_id]
    );

    // 4. ส่ง config กลับไปที่ device ผ่าน MQTT
    const configMessage = {
      device_id,
      approved: true,
      registration_datetime: new Date().toISOString(),
      meter_info: {
        meter_model_name,
        meter_manufacturer,
        rated_voltage,
        rated_current,
        rated_power,
        power_phase
      },
      location_info: {
        faculty_name,
        building,
        floor,
        room
      },
      administrative_info: {
        responsible_person,
        contact_info,
        admin_notes
      },
      data_collection_settings: {
        collection_interval: pending.data_collection_interval || 15,
        enabled_measurements: [
          "voltage", "current", "power", "power_quality",
          "energy_consumption", "environmental", "device_status"
        ]
      }
    };

    // ส่ง config ไปที่ MQTT topic
    const configTopic = `devices/engineering/${device_id}/config`;
    const mqttService = getMQTTService();
    await mqttService.publish(configTopic, JSON.stringify(configMessage));

    await query('COMMIT');

    console.log('Device approved successfully:', device_id);

    return NextResponse.json({
      success: true,
      message: 'Device approved and registered successfully',
      data: {
        device_id,
        config_sent_to: configTopic
      }
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Error approving device:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      message: 'Failed to approve device: ' + errorMessage
    }, { status: 500 });
  }
}
