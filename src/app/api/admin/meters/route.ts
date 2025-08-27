import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET /api/admin/meters - ดึงข้อมูลมิเตอร์ทั้งหมด
export async function GET() {
  try {
    const result = await query(`
      SELECT 
        mp.meter_id,
        mp.model_name,
        mp.manufacturer_id,
        m.name as manufacturer_name,
        mp.power_spec_id,
        ps.rated_voltage,
        ps.rated_current,
        ps.rated_power,
        ps.power_phase,
        ps.frequency,
        ps.accuracy,
        mp.meter_type,
        mp.manufacture_date,
        mp.created_at
      FROM meter_prop mp
      JOIN manufacturers m ON mp.manufacturer_id = m.id
      JOIN power_specifications ps ON mp.power_spec_id = ps.id
      ORDER BY mp.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching meters:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch meters'
    }, { status: 500 });
  }
}

// POST /api/admin/meters - เพิ่มมิเตอร์ใหม่
export async function POST(request: NextRequest) {
  try {
    await query('BEGIN');

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

    // ตรวจสอบว่ามี meter model ซ้ำกับผู้ผลิตเดียวกันหรือไม่
    const existingMeter = await query(`
      SELECT meter_id FROM meter_prop 
      WHERE model_name = $1 AND manufacturer_id = $2
    `, [model_name, manufacturer_id]);

    if (existingMeter.rows.length > 0) {
      await query('ROLLBACK');
      return NextResponse.json({
        success: false,
        message: 'มิเตอร์รุ่นนี้จากผู้ผลิตนี้มีอยู่แล้วในระบบ'
      }, { status: 400 });
    }

    // เพิ่ม meter ใหม่
    const meterResult = await query(`
      INSERT INTO meter_prop (
        model_name, manufacturer_id, power_spec_id, meter_type, manufacture_date
      ) VALUES ($1, $2, $3, $4, $5) 
      RETURNING meter_id
    `, [
      model_name,
      manufacturer_id,
      finalPowerSpecId,
      meter_type,
      manufacture_date || null
    ]);

    await query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'เพิ่มมิเตอร์สำเร็จ',
      data: { meter_id: meterResult.rows[0].meter_id }
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Error creating meter:', error);
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเพิ่มมิเตอร์'
    }, { status: 500 });
  }
}
