import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET /api/admin/power-specifications - ดึงข้อมูล power specs ทั้งหมด
export async function GET() {
  try {
    const result = await query(`
      SELECT 
        id,
        rated_voltage,
        rated_current,
        rated_power,
        power_phase,
        frequency,
        accuracy,
        created_at
      FROM power_specifications
      ORDER BY rated_power ASC, power_phase ASC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching power specifications:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch power specifications'
    }, { status: 500 });
  }
}
