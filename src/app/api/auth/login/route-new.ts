import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
const bcrypt = require('bcryptjs');

export async function POST(request: NextRequest) {
  console.log('[DEBUG] API Login endpoint called');
  
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('[DEBUG] API Login attempt for email:', email);

    // ตรวจสอบ input
    if (!email || !password) {
      console.log('[DEBUG] API Login - Missing email or password');
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // เชื่อมต่อฐานข้อมูล
    const client = await pool.connect();
    
    try {
      // ดึงข้อมูล user จากฐานข้อมูล
      const userResult = await client.query(
        'SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        console.log('[DEBUG] API Login - User not found');
        return NextResponse.json(
          { success: false, message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const user = userResult.rows[0];

      // ตรวจสอบว่า user active หรือไม่
      if (!user.is_active) {
        console.log('[DEBUG] API Login - User account is inactive');
        return NextResponse.json(
          { success: false, message: 'Account is inactive' },
          { status: 401 }
        );
      }

      // ตรวจสอบ password
      let isPasswordValid = false;
      
      // ถ้าเป็น admin@example.com ให้ใช้ mock password ก่อน
      if (email === 'admin@example.com' && password === 'admin123') {
        isPasswordValid = true;
        console.log('[DEBUG] API Login - Using mock authentication for admin');
      } else {
        // ใช้ bcrypt สำหรับ password อื่นๆ
        isPasswordValid = await bcrypt.compare(password, user.password_hash);
      }
      
      if (!isPasswordValid) {
        console.log('[DEBUG] API Login - Invalid password');
        return NextResponse.json(
          { success: false, message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // อัปเดต last_login
      await client.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      console.log('[DEBUG] API Login - Login successful, updated last_login for user:', user.id);

      // Mock token (ในอนาคตควรใช้ JWT จริง)
      const token = 'mock-jwt-token-' + Date.now();
      
      console.log('[DEBUG] API Login - Generated token for user:', user.email);
      
      // สร้าง response
      const response = NextResponse.json(
        {
          success: true,
          message: 'Login successful',
          data: {
            user: {
              id: user.id,
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              role: user.role
            },
            token
          }
        },
        { status: 200 }
      );

      console.log('[DEBUG] API Login - Setting cookie');
      // ตั้งค่า cookie สำหรับ token
      response.cookies.set('auth-token', token, {
        httpOnly: false, // เปลี่ยนเป็น false เพื่อให้ client อ่านได้
        secure: false, // เปลี่ยนเป็น false สำหรับ development
        sameSite: 'lax', // เปลี่ยนจาก strict เป็น lax
        maxAge: 24 * 60 * 60, // 24 ชั่วโมง
        path: '/'
      });

      console.log('[DEBUG] API Login - Cookie set with options:', {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60,
        path: '/'
      });

      console.log('[DEBUG] API Login - Returning success response');
      return response;

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[DEBUG] API Login error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
