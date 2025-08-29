import { NextRequest, NextResponse } from 'next/server';
import { query, withTransaction } from '@/lib/database';

// GET /api/admin/devices/[id] - ดึงข้อมูลอุปกรณ์ตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deviceId } = await params;
    
    console.log('Fetching device data for ID:', deviceId);
    
    const result = await query(`
      SELECT 
        dp.*,
        f.faculty_name,
        f.faculty_code,
        l.building,
        l.floor,
        l.room,
        mp.model_name as meter_model_name,
        m.name as manufacturer_name,
        ps.rated_voltage,
        ps.rated_current,
        ps.rated_power,
        ps.power_phase
      FROM devices_prop dp
      LEFT JOIN locations l ON dp.location_id = l.id
      LEFT JOIN faculties f ON l.faculty_id = f.id
      LEFT JOIN meter_prop mp ON dp.meter_id = mp.meter_id
      LEFT JOIN manufacturers m ON mp.manufacturer_id = m.id
      LEFT JOIN power_specifications ps ON mp.power_spec_id = ps.id
      WHERE dp.device_id = $1
    `, [deviceId]);

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'ไม่พบอุปกรณ์ที่ระบุ'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'ดึงข้อมูลอุปกรณ์สำเร็จ',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching device:', error);
    
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/admin/devices/[id] - อัปเดตข้อมูลอุปกรณ์
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deviceId } = await params;
    const body = await request.json();
    
    console.log('Updating device:', deviceId, 'with data:', body);

    // Validate required fields
    const {
      device_name,
      device_type,
      status,
      is_enabled,
      ip_address,
      mac_address,
      connection_type,
      data_collection_interval,
      firmware_version,
      location_id,
      meter_id
    } = body;

    if (!device_name || !device_type) {
      return NextResponse.json({
        success: false,
        message: 'กรุณากรอกข้อมูลที่จำเป็น (ชื่ออุปกรณ์และประเภท)'
      }, { status: 400 });
    }

    // Check if device exists
    const existingDevice = await query(
      'SELECT id FROM devices_prop WHERE device_id = $1',
      [deviceId]
    );

    if (existingDevice.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'ไม่พบอุปกรณ์ที่ระบุ'
      }, { status: 404 });
    }

    // Update device in transaction
    const updateResult = await withTransaction(async (client) => {
      // Update devices_prop
      const result = await client.query(`
        UPDATE devices_prop 
        SET 
          device_name = $2,
          device_type = $3,
          status = $4,
          is_enabled = $5,
          ip_address = $6,
          mac_address = $7,
          connection_type = $8,
          data_collection_interval = $9,
          firmware_version = $10,
          location_id = $11,
          meter_id = $12,
          updated_at = NOW()
        WHERE device_id = $1
        RETURNING *
      `, [
        deviceId,
        device_name,
        device_type,
        status || 'active',
        is_enabled !== undefined ? is_enabled : true,
        ip_address,
        mac_address,
        connection_type,
        data_collection_interval || 60,
        firmware_version,
        location_id,
        meter_id
      ]);

      return result.rows[0];
    });

    // If device status changed to active and enabled, log the change
    if (status === 'active' && is_enabled) {
      console.log('Device updated to active status:', deviceId);
      // Note: MQTT config sending can be added later if needed
    }

    return NextResponse.json({
      success: true,
      message: 'อัปเดตข้อมูลอุปกรณ์สำเร็จ',
      data: updateResult
    });

  } catch (error) {
    console.error('Error updating device:', error);
    
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตอุปกรณ์',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/admin/devices/[id] - ลบอุปกรณ์
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deviceId } = await params;
    
    console.log('🗑️ DELETE API called with params:', { 
      id: deviceId, 
      rawParams: params,
      url: request.url 
    });

    // Validate input
    if (!deviceId || deviceId.trim() === '') {
      console.log('❌ Invalid device ID provided:', deviceId);
      return NextResponse.json({
        success: false,
        message: 'Device ID is required and cannot be empty'
      }, { status: 400 });
    }

    console.log('🔍 Checking if device exists...');
    const existingDevice = await query(
      'SELECT id, device_name FROM devices_prop WHERE device_id = $1',
      [deviceId]
    );

    console.log('📋 Device lookup result:', {
      found: existingDevice.rows.length > 0,
      deviceId,
      rowCount: existingDevice.rows.length,
      rows: existingDevice.rows
    });

    if (existingDevice.rows.length === 0) {
      console.log('❌ Device not found:', deviceId);
      return NextResponse.json({
        success: false,
        message: `ไม่พบอุปกรณ์ที่มี ID: ${deviceId}`
      }, { status: 404 });
    }

    const deviceName = existingDevice.rows[0].device_name;
    console.log('✅ Found device to delete:', { deviceId, deviceName });

    // Delete device and related data step by step with individual error handling
    console.log('🔄 Starting deletion process...');
    
    try {
      // Delete from device_approval_history (uses device_id as string)
      console.log('🗑️ Deleting from device_approval_history...');
      const historyResult = await query('DELETE FROM device_approval_history WHERE device_id = $1', [deviceId]);
      console.log('✅ Deleted', historyResult.rowCount, 'approval history records');
    } catch (error) {
      console.error('⚠️ Error deleting from device_approval_history:', error);
      // Continue with other deletions
    }
    
    try {
      // Delete from devices_history (historical data)
      console.log('🗑️ Deleting from devices_history...');
      const devHistoryResult = await query('DELETE FROM devices_history WHERE device_id = $1', [deviceId]);
      console.log('✅ Deleted', devHistoryResult.rowCount, 'device history records');
    } catch (error) {
      console.error('⚠️ Error deleting from devices_history:', error);
    }
    
    try {
      // Delete from devices_data (sensor data)
      console.log('🗑️ Deleting from devices_data...');
      const dataResult = await query('DELETE FROM devices_data WHERE device_id = $1', [deviceId]);
      console.log('✅ Deleted', dataResult.rowCount, 'device data records');
    } catch (error) {
      console.error('⚠️ Error deleting from devices_data:', error);
    }
    
    try {
      // Delete from devices_pending if exists
      console.log('🗑️ Deleting from devices_pending...');
      const pendingResult = await query('DELETE FROM devices_pending WHERE device_id = $1', [deviceId]);
      console.log('✅ Deleted', pendingResult.rowCount, 'pending device records');
    } catch (error) {
      console.error('⚠️ Error deleting from devices_pending:', error);
    }
    
    try {
      // Delete from devices_rejected if exists  
      console.log('🗑️ Deleting from devices_rejected...');
      const rejectedResult = await query('DELETE FROM devices_rejected WHERE device_id = $1', [deviceId]);
      console.log('✅ Deleted', rejectedResult.rowCount, 'rejected device records');
    } catch (error) {
      console.error('⚠️ Error deleting from devices_rejected:', error);
    }
    
    // Finally, delete from devices_prop (main device record) - this one must succeed
    console.log('🗑️ Deleting from devices_prop (main table)...');
    const propResult = await query('DELETE FROM devices_prop WHERE device_id = $1', [deviceId]);
    console.log('✅ Deleted', propResult.rowCount, 'device property records');
    
    if (propResult.rowCount === 0) {
      throw new Error('Failed to delete device from main table (devices_prop)');
    }
    
    console.log('🎉 Device deletion completed successfully:', deviceId);

    return NextResponse.json({
      success: true,
      message: `ลบอุปกรณ์ "${deviceName}" สำเร็จ`
    });

  } catch (error) {
    console.error('💥 Error deleting device:', error);
    
    // More detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const stackTrace = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', {
      message: errorMessage,
      stack: stackTrace
    });
    
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบอุปกรณ์',
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? stackTrace : undefined
    }, { status: 500 });
  }
}
