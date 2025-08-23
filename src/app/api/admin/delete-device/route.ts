import { NextResponse } from 'next/server';
import pool from '@/lib/database';
import { withRole, AuthenticatedRequest, createAuthResponse } from '@/lib/auth-middleware';

// DELETE /api/admin/delete-device - ลบอุปกรณ์จากระบบ (Admin only)
async function deleteDevice(request: AuthenticatedRequest) {
  try {
    console.log('[INFO] Delete Device API - Processing deletion');
    console.log('[DEBUG] Request user:', request.user);
    console.log('[DEBUG] Request method:', request.method);
    
    // Safely parse request body
    let body;
    try {
      body = await request.json();
      console.log('[DEBUG] Request body parsed:', body);
    } catch (parseError) {
      console.error('[ERROR] Failed to parse request body:', parseError);
      return createAuthResponse(
        false,
        null,
        'ข้อมูลคำขอไม่ถูกต้อง กรุณาส่งข้อมูลในรูปแบบ JSON',
        400
      );
    }
    
    const { device_id } = body;
    
    // Validate required fields
    if (!device_id) {
      return createAuthResponse(
        false,
        null,
        'กรุณาระบุ device_id ที่จะลบ',
        400
      );
    }
    
    // Log admin user performing deletion
    const user = request.user!;
    console.log(`[INFO] Admin user ${user.email} (${user.role}) attempting to delete device: ${device_id}`);
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // ตรวจสอบว่า device_id นี้มีอยู่จริงหรือไม่
      const existingDevice = await client.query(
        'SELECT device_id, device_name, meter_model_id FROM devices_prop WHERE device_id = $1',
        [device_id]
      );
      
      if (existingDevice.rows.length === 0) {
        await client.query('ROLLBACK');
        return createAuthResponse(
          false,
          null,
          'ไม่พบอุปกรณ์ที่ระบุในระบบ',
          404
        );
      }
      
      const deviceInfo = existingDevice.rows[0];
      console.log(`[INFO] Found device to delete: ${device_id} (${deviceInfo.device_name})`);
      
      // นับจำนวนข้อมูลที่จะลบ
      const deletedCounts = {
        devices_data: 0,
        devices_history: 0,
        devices_prop: 0,
        meter_prop: 0
      };
      
      // 1. ลบข้อมูล historical data ถ้ามี (ตรวจสอบว่าตารางมีอยู่หรือไม่ก่อน)
      try {
        const historyCheck = await client.query(
          "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'devices_history')"
        );
        
        if (historyCheck.rows[0].exists) {
          const deleteHistoryResult = await client.query(
            'DELETE FROM devices_history WHERE device_id = $1',
            [device_id]
          );
          deletedCounts.devices_history = deleteHistoryResult.rowCount || 0;
          console.log(`[INFO] Deleted ${deletedCounts.devices_history} records from devices_history for device: ${device_id}`);
        } else {
          console.log('[INFO] devices_history table does not exist, skipping historical data deletion');
        }
      } catch (historyError) {
        console.warn('[WARN] Error deleting historical data (non-critical):', historyError);
        // ไม่หยุดการทำงานถ้าลบ history ไม่ได้
      }
      
      // 2. ลบข้อมูลจากตาราง devices_data (Foreign Key Constraint CASCADE จะจัดการให้อัตโนมัติ แต่เราทำด้วยตนเองเพื่อให้แน่ใจ)
      const deleteDataResult = await client.query(
        'DELETE FROM devices_data WHERE device_id = $1',
        [device_id]
      );
      deletedCounts.devices_data = deleteDataResult.rowCount || 0;
      console.log(`[INFO] Deleted ${deletedCounts.devices_data} records from devices_data for device: ${device_id}`);
      
      // 3. ลบอุปกรณ์จากตาราง devices_prop (หลักๆ)
      const deleteDeviceResult = await client.query(
        'DELETE FROM devices_prop WHERE device_id = $1',
        [device_id]
      );
      deletedCounts.devices_prop = deleteDeviceResult.rowCount || 0;
      console.log(`[INFO] Deleted ${deletedCounts.devices_prop} records from devices_prop for device: ${device_id}`);
      
      // 4. ตรวจสอบและลบข้อมูล meter_prop ถ้าไม่มีอุปกรณ์อื่นใช้รุ่นเดียวกัน
      let meterPropDeleted = 0;
      if (deviceInfo.meter_model_id) {
        try {
          // ตรวจสอบว่ามีอุปกรณ์อื่นใช้รุ่นมิเตอร์เดียวกันหรือไม่
          const otherDevicesCheck = await client.query(
            'SELECT COUNT(*) FROM devices_prop WHERE meter_model_id = $1 AND device_id != $2',
            [deviceInfo.meter_model_id, device_id]
          );
          
          const otherDevicesCount = parseInt(otherDevicesCheck.rows[0].count);
          console.log(`[INFO] Found ${otherDevicesCount} other devices using meter model: ${deviceInfo.meter_model_id}`);
          
          if (otherDevicesCount === 0) {
            // ไม่มีอุปกรณ์อื่นใช้รุ่นนี้ สามารถลบได้
            const deleteMeterPropResult = await client.query(
              'DELETE FROM meter_prop WHERE meter_model_id = $1',
              [deviceInfo.meter_model_id]
            );
            meterPropDeleted = deleteMeterPropResult.rowCount || 0;
            deletedCounts.meter_prop = meterPropDeleted;
            console.log(`[INFO] Deleted meter_prop for model ${deviceInfo.meter_model_id} (${meterPropDeleted} records)`);
          } else {
            console.log(`[INFO] Keeping meter_prop for model ${deviceInfo.meter_model_id} - still used by ${otherDevicesCount} other devices`);
          }
        } catch (meterError) {
          console.warn('[WARN] Error handling meter_prop deletion (non-critical):', meterError);
        }
      }
      
      // 5. ตรวจสอบและลบข้อมูลอื่นๆ ที่เกี่ยวข้อง (ถ้ามี)
      // สำหรับตารางอื่นๆ ที่อาจมีการอ้างอิงถึง device_id ในอนาคต
      const additionalTables = ['device_alerts', 'device_logs', 'device_settings']; // รายชื่อตารางที่อาจมีในอนาคต
      
      for (const tableName of additionalTables) {
        try {
          const tableCheck = await client.query(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)",
            [tableName]
          );
          
          if (tableCheck.rows[0].exists) {
            const deleteResult = await client.query(
              `DELETE FROM ${tableName} WHERE device_id = $1`,
              [device_id]
            );
            if (deleteResult.rowCount && deleteResult.rowCount > 0) {
              console.log(`[INFO] Deleted ${deleteResult.rowCount} records from ${tableName} for device: ${device_id}`);
            }
          }
        } catch (error) {
          console.warn(`[WARN] Error checking/deleting from ${tableName} (non-critical):`, error);
          // ไม่หยุดการทำงานถ้าลบข้อมูลเสริมไม่ได้
        }
      }
      
      await client.query('COMMIT');
      
      // สรุปผลการลบข้อมูล
      const totalDeleted = deletedCounts.devices_prop + deletedCounts.devices_data + deletedCounts.devices_history + deletedCounts.meter_prop;
      
      console.log(`[SUCCESS] Admin ${user.email} successfully deleted device: ${device_id} (${deviceInfo.device_name})`);
      console.log(`[SUCCESS] Total records deleted: ${totalDeleted} (devices_prop: ${deletedCounts.devices_prop}, devices_data: ${deletedCounts.devices_data}, devices_history: ${deletedCounts.devices_history}, meter_prop: ${deletedCounts.meter_prop})`);
      
      return createAuthResponse(
        true,
        {
          device_id: device_id,
          device_name: deviceInfo.device_name,
          deleted_by: user.email,
          deleted_records: {
            devices_prop: deletedCounts.devices_prop,
            devices_data: deletedCounts.devices_data,
            devices_history: deletedCounts.devices_history,
            meter_prop: deletedCounts.meter_prop,
            total: totalDeleted
          },
          message: 'อุปกรณ์และข้อมูลมิเตอร์ที่เกี่ยวข้องทั้งหมดถูกลบออกจากระบบเรียบร้อยแล้ว รวมถึงข้อมูลสเปคมิเตอร์ (ถ้าไม่มีอุปกรณ์อื่นใช้)'
        },
        `ลบอุปกรณ์ "${deviceInfo.device_name}" และข้อมูลมิเตอร์ที่เกี่ยวข้องเรียบร้อยแล้ว (รวม ${totalDeleted} รายการ)`
      );
      
    } catch (dbError) {
      await client.query('ROLLBACK');
      console.error('[ERROR] Database error during device deletion:', dbError);
      
      return createAuthResponse(
        false,
        null,
        'เกิดข้อผิดพลาดในการลบข้อมูลจากฐานข้อมูล',
        500
      );
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('[ERROR] Delete Device API error:', error);
    console.error('[ERROR] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Ensure we always return a proper JSON response
    try {
      return createAuthResponse(
        false,
        null,
        error instanceof Error ? `เกิดข้อผิดพลาด: ${error.message}` : 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        500
      );
    } catch (responseError) {
      console.error('[CRITICAL] Error creating error response:', responseError);
      // Fallback manual response
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'เกิดข้อผิดพลาดร้ายแรงภายในเซิร์ฟเวอร์',
          data: null
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
}

// Protected endpoint สำหรับ admin เท่านั้น
export const DELETE = withRole(['admin'])(deleteDevice);
