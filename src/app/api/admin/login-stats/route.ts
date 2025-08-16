import { NextRequest, NextResponse } from 'next/server';
import { getLoginStats, getRecentlyLoggedInUsers } from '@/lib/user-auth';

/**
 * API สำหรับดูสถิติการ login
 * GET /api/admin/login-stats
 */
export async function GET(_request: NextRequest) {
  try {
    console.log('[DEBUG] Login stats API called');

    // ดึงสถิติการ login
    const stats = await getLoginStats();
    
    // ดึงผู้ใช้ที่ login ล่าสุด 10 คน
    const recentUsers = await getRecentlyLoggedInUsers(10);
    
    // จัดรูปแบบข้อมูลผู้ใช้ล่าสุด
    const formattedRecentUsers = recentUsers.map(user => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      last_login: user.last_login,
      is_active: user.is_active
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentUsers: formattedRecentUsers
      }
    });

  } catch (error) {
    console.error('[DEBUG] Login stats API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch login statistics' 
      },
      { status: 500 }
    );
  }
}
