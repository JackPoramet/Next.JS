import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

/**
 * GET /api/admin/responsible-persons
 * ดึงรายการผู้รับผิดชอบทั้งหมด
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get('faculty_id');
    const isActive = searchParams.get('is_active');

    let sqlQuery = `
      SELECT 
        rp.id,
        rp.name,
        rp.email,
        rp.phone,
        rp.department,
        rp.position,
        rp.faculty_id,
        rp.is_active,
        rp.created_at,
        rp.updated_at,
        f.faculty_name,
        f.faculty_code
      FROM responsible_persons rp
      LEFT JOIN faculties f ON rp.faculty_id = f.id
      WHERE 1=1
    `;

    const params: (number | boolean)[] = [];
    let paramIndex = 1;

    if (facultyId) {
      sqlQuery += ` AND rp.faculty_id = $${paramIndex}`;
      params.push(parseInt(facultyId));
      paramIndex++;
    }

    if (isActive !== null && isActive !== undefined) {
      sqlQuery += ` AND rp.is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    sqlQuery += ` ORDER BY rp.name ASC`;

    const result = await query(sqlQuery, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching responsible persons:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/responsible-persons
 * เพิ่มผู้รับผิดชอบใหม่
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, department, position, faculty_id } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกชื่อและอีเมล' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingPerson = await query(
      'SELECT id FROM responsible_persons WHERE email = $1',
      [email]
    );

    if (existingPerson.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'อีเมลนี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      );
    }

    // Insert new responsible person
    const result = await query(`
      INSERT INTO responsible_persons (name, email, phone, department, position, faculty_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, email, phone, department, position, faculty_id]);

    return NextResponse.json({
      success: true,
      message: 'เพิ่มผู้รับผิดชอบสำเร็จ',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating responsible person:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการเพิ่มผู้รับผิดชอบ' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/responsible-persons
 * อัพเดทข้อมูลผู้รับผิดชอบ
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, phone, department, position, faculty_id, is_active } = body;

    // Validate required fields
    if (!id || !name || !email) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลที่จำเป็น' },
        { status: 400 }
      );
    }

    // Check if email already exists for other persons
    const existingPerson = await query(
      'SELECT id FROM responsible_persons WHERE email = $1 AND id != $2',
      [email, id]
    );

    if (existingPerson.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'อีเมลนี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      );
    }

    // Update responsible person
    const result = await query(`
      UPDATE responsible_persons 
      SET name = $1, email = $2, phone = $3, department = $4, 
          position = $5, faculty_id = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [name, email, phone, department, position, faculty_id, is_active, id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบผู้รับผิดชอบที่ระบุ' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'อัพเดทข้อมูลผู้รับผิดชอบสำเร็จ',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating responsible person:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/responsible-persons
 * ลบผู้รับผิดชอบ (Soft delete - เปลี่ยนสถานะเป็น inactive)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุรหัสผู้รับผิดชอบ' },
        { status: 400 }
      );
    }

    // Soft delete by setting is_active to false
    const result = await query(`
      UPDATE responsible_persons 
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบผู้รับผิดชอบที่ระบุ' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ลบผู้รับผิดชอบสำเร็จ'
    });

  } catch (error) {
    console.error('Error deleting responsible person:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการลบผู้รับผิดชอบ' },
      { status: 500 }
    );
  }
}
