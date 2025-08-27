import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

/**
 * GET /api/admin/faculties
 * ดึงรายการคณะทั้งหมด
 */
export async function GET() {
  try {
    const result = await query(`
      SELECT 
        id,
        faculty_code,
        faculty_name,
        contact_email,
        contact_phone,
        created_at
      FROM faculties 
      ORDER BY faculty_name
    `);

    return NextResponse.json({
      success: true,
      message: 'Faculties retrieved successfully',
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching faculties:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch faculties: ' + errorMessage,
      data: []
    }, { status: 500 });
  }
}
