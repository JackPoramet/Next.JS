import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// PUT /api/admin/meters/[id] - แก้ไขมิเตอร์
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await query('BEGIN');

    const { id: meterId } = await params;
    const body = await request.json();
    const {
      model_name,
      manufacturer_id,
      power_spec_id,
      meter_type,
      manufacture_date,
      createNewPowerSpec,
      // สำหรับสร้าง power spec ใหม่
      rated_voltage,
      rated_current,
      rated_power,
      power_phase,
      frequency,
      accuracy
    } = body;

    let finalPowerSpecId = power_spec_id;

    // ถ้าต้องการสร้าง power spec ใหม่
    if (createNewPowerSpec) {
      // ตรวจสอบว่ามี spec เหมือนกันอยู่แล้วหรือไม่
      const existingSpec = await query(`
        SELECT id FROM power_specifications 
        WHERE rated_voltage = $1 AND rated_current = $2 AND rated_power = $3 AND power_phase = $4
      `, [rated_voltage, rated_current, rated_power, power_phase]);

      if (existingSpec.rows.length > 0) {
        finalPowerSpecId = existingSpec.rows[0].id;
      } else {
        // สร้าง power spec ใหม่
        const newSpecResult = await query(`
          INSERT INTO power_specifications (
            rated_voltage, rated_current, rated_power, power_phase, frequency, accuracy
          ) VALUES ($1, $2, $3, $4, $5, $6) 
          RETURNING id
        `, [rated_voltage, rated_current, rated_power, power_phase, frequency || 50.0, accuracy || null]);

        finalPowerSpecId = newSpecResult.rows[0].id;
      }
    }

    // ตรวจสอบว่ามี meter อยู่หรือไม่
    const existingMeter = await query(`
      SELECT meter_id FROM meter_prop WHERE meter_id = $1
    `, [meterId]);

    if (existingMeter.rows.length === 0) {
      await query('ROLLBACK');
      return NextResponse.json({
        success: false,
        message: 'ไม่พบมิเตอร์ที่ต้องการแก้ไข'
      }, { status: 404 });
    }

    // ตรวจสอบว่าชื่อรุ่นซ้ำกับผู้ผลิตเดียวกันหรือไม่ (ยกเว้นตัวเอง)
    const duplicateCheck = await query(`
      SELECT meter_id FROM meter_prop 
      WHERE model_name = $1 AND manufacturer_id = $2 AND meter_id != $3
    `, [model_name, manufacturer_id, meterId]);

    if (duplicateCheck.rows.length > 0) {
      await query('ROLLBACK');
      return NextResponse.json({
        success: false,
        message: 'มิเตอร์รุ่นนี้จากผู้ผลิตนี้มีอยู่แล้วในระบบ'
      }, { status: 400 });
    }

    // อัปเดต meter
    await query(`
      UPDATE meter_prop SET 
        model_name = $1,
        manufacturer_id = $2,
        power_spec_id = $3,
        meter_type = $4,
        manufacture_date = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE meter_id = $6
    `, [
      model_name,
      manufacturer_id,
      finalPowerSpecId,
      meter_type,
      manufacture_date || null,
      meterId
    ]);

    await query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'อัปเดตมิเตอร์สำเร็จ'
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Error updating meter:', error);
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตมิเตอร์'
    }, { status: 500 });
  }
}

// DELETE /api/admin/meters/[id] - ลบมิเตอร์
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: meterId } = await params;

    // ตรวจสอบว่ามิเตอร์นี้ถูกใช้งานโดยอุปกรณ์หรือไม่
    const usageCheck = await query(`
      SELECT device_id FROM devices_prop WHERE meter_id = $1 LIMIT 1
    `, [meterId]);

    if (usageCheck.rows.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'ไม่สามารถลบมิเตอร์นี้ได้ เนื่องจากมีอุปกรณ์ใช้งานอยู่'
      }, { status: 400 });
    }

    // ตรวจสอบว่ามี meter อยู่หรือไม่
    const existingMeter = await query(`
      SELECT meter_id FROM meter_prop WHERE meter_id = $1
    `, [meterId]);

    if (existingMeter.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'ไม่พบมิเตอร์ที่ต้องการลบ'
      }, { status: 404 });
    }

    // ลบ meter
    await query(`
      DELETE FROM meter_prop WHERE meter_id = $1
    `, [meterId]);

    return NextResponse.json({
      success: true,
      message: 'ลบมิเตอร์สำเร็จ'
    });

  } catch (error) {
    console.error('Error deleting meter:', error);
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบมิเตอร์'
    }, { status: 500 });
  }
}
