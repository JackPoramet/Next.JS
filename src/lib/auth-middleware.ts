import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken, authorizeRole, JWTPayload } from '@/lib/jwt';

// Interface สำหรับ request ที่ผ่าน authentication แล้ว
export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

// Type สำหรับ handler function ที่ผ่าน authentication แล้ว
export type AuthenticatedHandler = (request: AuthenticatedRequest) => Promise<NextResponse>;

// ฟังก์ชันสำหรับสร้าง response ที่เป็น standard format
export const createAuthResponse = (
  success: boolean,
  data: unknown = null,
  message: string = '',
  status: number = 200
): NextResponse => {
  return NextResponse.json(
    {
      success,
      message,
      data
    },
    { status }
  );
};

// Higher-order function สำหรับ authentication middleware
export const withAuth = (handler: AuthenticatedHandler) => {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // ตรวจสอบ authentication
      const authResult = authenticateToken(request);
      
      if (!authResult.isAuthenticated || !authResult.user) {
        return createAuthResponse(
          false,
          null,
          authResult.error || 'Authentication required',
          401
        );
      }

      // เพิ่ม user ข้อมูลใน request
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = authResult.user;

      // เรียก handler function
      return await handler(authenticatedRequest);
      
    } catch (error) {
      console.error('Auth middleware error:', error);
      return createAuthResponse(
        false,
        null,
        'Internal server error',
        500
      );
    }
  };
};

// Higher-order function สำหรับ role-based authorization
export const withRole = (allowedRoles: string[]) => {
  return (handler: AuthenticatedHandler) => {
    return async (request: NextRequest): Promise<NextResponse> => {
      try {
        // ตรวจสอบ authentication ก่อน
        const authResult = authenticateToken(request);
        
        if (!authResult.isAuthenticated || !authResult.user) {
          return createAuthResponse(
            false,
            null,
            authResult.error || 'Authentication required',
            401
          );
        }

        // ตรวจสอบ role authorization
        if (!authorizeRole(authResult.user, allowedRoles)) {
          return createAuthResponse(
            false,
            null,
            `Access denied. Required roles: ${allowedRoles.join(', ')}`,
            403
          );
        }

        // เพิ่ม user ข้อมูลใน request
        const authenticatedRequest = request as AuthenticatedRequest;
        authenticatedRequest.user = authResult.user;

        // เรียก handler function
        return await handler(authenticatedRequest);
        
      } catch (error) {
        console.error('Role middleware error:', error);
        return createAuthResponse(
          false,
          null,
          'Internal server error',
          500
        );
      }
    };
  };
};

// Helper function สำหรับ admin-only endpoints
export const withAdminRole = (handler: AuthenticatedHandler) => {
  return withRole(['admin'])(handler);
};

// Helper function สำหรับ user-only endpoints
export const withUserRole = (handler: AuthenticatedHandler) => {
  return withRole(['user', 'admin'])(handler);
};
