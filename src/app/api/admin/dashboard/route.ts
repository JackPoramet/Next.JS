import { withRole, AuthenticatedRequest, createAuthResponse } from '@/lib/auth-middleware';

// Admin-only API endpoint
async function getAdminData(request: AuthenticatedRequest) {
  try {
    const user = request.user!;

    // ข้อมูลที่เฉพาะ admin เท่านั้นที่ดูได้
    const adminData = {
      totalUsers: 150,
      totalEnergy: 25000,
      systemStatus: 'active',
      lastUpdate: new Date().toISOString()
    };

    return createAuthResponse(true, {
      adminData,
      requestedBy: {
        id: user.userId,
        email: user.email,
        role: user.role
      },
      message: 'Admin data retrieved successfully'
    });

  } catch (error) {
    console.error('Get admin data error:', error);
    return createAuthResponse(false, null, 'Failed to get admin data', 500);
  }
}

// Protected endpoint สำหรับ admin เท่านั้น
export const GET = withRole(['admin'])(getAdminData);
