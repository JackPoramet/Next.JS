import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { authenticateAndUpdateLogin } from '@/lib/user-auth';

export async function POST(request: NextRequest) {
  console.log('[DEBUG] API Login endpoint called');
  
  try {
    // ดึงข้อมูลจาก request body
    const { email, password } = await request.json();
    
    console.log('[DEBUG] API Login - Email:', email);
    console.log('[DEBUG] API Login - Password length:', password?.length);

    // ตรวจสอบว่ามีข้อมูลครบหรือไม่
    if (!email || !password) {
      console.log('[DEBUG] API Login - Missing email or password');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email and password are required' 
        },
        { status: 400 }
      );
    }

    // ตรวจสอบการเข้าสู่ระบบและอัปเดต last_login
    console.log('[DEBUG] API Login - Authenticating user and updating last_login');
    const authResult = await authenticateAndUpdateLogin(email, password);

    if (!authResult.success) {
      console.log('[DEBUG] API Login - Authentication failed:', authResult.message);
      return NextResponse.json(
        { 
          success: false, 
          message: authResult.message 
        },
        { status: 401 }
      );
    }

    // สร้าง JWT token
    console.log('[DEBUG] API Login - Creating JWT token');
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    const token = jwt.sign(
      {
        userId: authResult.user!.id,
        email: authResult.user!.email,
        role: authResult.user!.role
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log('[DEBUG] API Login - Authentication successful');
    
    // สร้าง response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: authResult.user!.id,
            email: authResult.user!.email,
            first_name: authResult.user!.first_name,
            last_name: authResult.user!.last_name,
            role: authResult.user!.role
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
      maxAge: 7 * 24 * 60 * 60, // 7 วัน
      path: '/'
    });

    console.log('[DEBUG] API Login - Cookie set with options:', {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    });

    console.log('[DEBUG] API Login - Returning success response');
    return response;

  } catch (error) {
    console.error('[DEBUG] API Login error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
