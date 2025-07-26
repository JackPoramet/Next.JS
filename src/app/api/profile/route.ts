import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedRequest, createAuthResponse } from '@/lib/auth-middleware';

// Protected API endpoint ที่ต้องการ JWT Bearer Token
async function getProfile(request: AuthenticatedRequest) {
  try {
    // ดึงข้อมูล user จาก token
    const user = request.user!;

    return createAuthResponse(true, {
      user: {
        id: user.userId,
        email: user.email,
        role: user.role
      },
      message: 'Profile retrieved successfully'
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return createAuthResponse(false, null, 'Failed to get profile', 500);
  }
}

// Export protected endpoint
export const GET = withAuth(getProfile);
