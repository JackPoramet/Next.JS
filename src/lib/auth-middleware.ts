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
      console.log('[DEBUG] withRole middleware - Start');
      console.log('[DEBUG] Allowed roles:', allowedRoles);
      console.log('[DEBUG] Request URL:', request.url);
      console.log('[DEBUG] Request method:', request.method);
      
      try {
        // ตรวจสอบ authentication ก่อน
        const authResult = authenticateToken(request);
        console.log('[DEBUG] Auth result:', { 
          isAuthenticated: authResult.isAuthenticated, 
          hasUser: !!authResult.user,
          error: authResult.error 
        });
        
        if (!authResult.isAuthenticated || !authResult.user) {
          console.log('[DEBUG] Authentication failed');
          return createAuthResponse(
            false,
            null,
            authResult.error || 'Authentication required',
            401
          );
        }

        console.log('[DEBUG] User authenticated:', { 
          userId: authResult.user.userId, 
          email: authResult.user.email, 
          role: authResult.user.role 
        });

        // ตรวจสอบ role authorization
        const hasRole = authorizeRole(authResult.user, allowedRoles);
        console.log('[DEBUG] Role check:', { userRole: authResult.user.role, allowedRoles, hasRole });
        
        if (!hasRole) {
          console.log('[DEBUG] Role authorization failed');
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

        console.log('[DEBUG] Calling handler function');
        // เรียก handler function
        const result = await handler(authenticatedRequest);
        console.log('[DEBUG] Handler completed successfully');
        return result;
        
      } catch (error) {
        console.error('[ERROR] Role middleware error:', error);
        console.error('[ERROR] Error stack:', error instanceof Error ? error.stack : 'No stack');
        
        try {
          return createAuthResponse(
            false,
            null,
            'Internal server error',
            500
          );
        } catch (responseError) {
          console.error('[CRITICAL] Error creating error response in middleware:', responseError);
          // Fallback manual response
          return new NextResponse(
            JSON.stringify({
              success: false,
              message: 'Critical server error',
              data: null
            }),
            { 
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
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
