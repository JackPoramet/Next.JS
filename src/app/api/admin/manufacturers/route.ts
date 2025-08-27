import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET /api/admin/manufacturers - ดึงข้อมูลผู้ผลิตทั้งหมด
export async function GET() {
  try {
    const result = await query(`
      SELECT id, name, country, created_at
      FROM manufacturers
      ORDER BY name ASC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch manufacturers'
    }, { status: 500 });
  }
}
