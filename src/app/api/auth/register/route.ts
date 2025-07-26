import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/User';
import { validatePassword } from '@/lib/auth';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // ดึงข้อมูลจาก request body
    const { email, password, first_name, last_name } = await request.json();

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email and password are required' 
        },
        { status: 400 }
      );
    }

    // ตรวจสอบรูปแบบ email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email format' 
        },
        { status: 400 }
      );
    }

    // ตรวจสอบความแข็งแกร่งของ password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: passwordValidation.message 
        },
        { status: 400 }
      );
    }

    // สร้าง user ใหม่
    const newUser = await UserModel.create({
      email,
      password,
      first_name,
      last_name,
      role: 'user' // default role
    });

    // สร้าง JWT Token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    // สร้าง response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            role: newUser.role
          },
          token
        }
      },
      { status: 201 }
    );

    // ตั้งค่า cookie สำหรับ token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 ชั่วโมง
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Registration API error:', error);
    
    // ตรวจสอบ error type
    if (error instanceof Error) {
      if (error.message === 'Email already exists') {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Email already exists' 
          },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
