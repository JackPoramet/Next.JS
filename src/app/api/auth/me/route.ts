import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/jwt';
import { UserModel } from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const authResult = authenticateToken(request);

    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Not authenticated' 
        },
        { status: 401 }
      );
    }

    // ดึงข้อมูล user ปัจจุบันจาก database
    const user = await UserModel.findById(authResult.user.userId);

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Authenticated',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role
          }
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Me API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
