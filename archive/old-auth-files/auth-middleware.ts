// Enhanced Authentication Middleware สำหรับ JWT Bearer Token
import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken, authorizeRole, JWTPayload } from './jwt';

// Type สำหรับ Response ของ API
export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export interface AuthResponse {
  success: boolean;
  user?: JWTPayload;
  error?: string;
  statusCode: number;
}

// Middleware สำหรับตรวจสอบ JWT Bearer Token
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse> | NextResponse) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const authResult = authenticateToken(request);
      
      if (!authResult.isAuthenticated) {
        return NextResponse.json(
          {
            success: false,
            error: authResult.error || 'Authentication required',
            message: 'Access denied. Please provide a valid Bearer token.'
          },
          { status: 401 }
        );
      }

      // เพิ่ม user ข้อมูลใน request
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = authResult.user;

      return handler(authenticatedRequest);
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Internal authentication error',
          message: 'An error occurred during authentication'
        },
        { status: 500 }
      );
    }
  };
}

// Middleware สำหรับตรวจสอบ Role-based authorization
export function withRole(allowedRoles: string[]) {
  return function(handler: (req: AuthenticatedRequest) => Promise<NextResponse> | NextResponse) {
    return withAuth(async (request: AuthenticatedRequest): Promise<NextResponse> => {
      if (!request.user) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication required',
            message: 'User authentication failed'
          },
          { status: 401 }
        );
      }

      const hasPermission = authorizeRole(request.user, allowedRoles);
      
      if (!hasPermission) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient permissions',
            message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
          },
          { status: 403 }
        );
      }

      return handler(request);
    });
  };
}

// Helper function สำหรับสร้าง Authentication Response
export function createAuthResponse(
  success: boolean, 
  data?: any, 
  error?: string, 
  statusCode: number = 200
): NextResponse {
  const response = {
    success,
    timestamp: new Date().toISOString(),
    ...(data && { data }),
    ...(error && { error })
  };

  return NextResponse.json(response, { status: statusCode });
}

// Helper function สำหรับดึงข้อมูล user จาก token
export function getCurrentUser(request: NextRequest): JWTPayload | null {
  const authResult = authenticateToken(request);
  return authResult.isAuthenticated ? authResult.user! : null;
}

// Utility function สำหรับตรวจสอบว่า request มี valid Bearer token หรือไม่
export function hasValidBearerToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const authResult = authenticateToken(request);
  return authResult.isAuthenticated;
}

// Helper สำหรับ extract token จาก Authorization header
export function extractBearerTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

// Type guard สำหรับตรวจสอบว่า request เป็น AuthenticatedRequest
export function isAuthenticatedRequest(request: NextRequest): request is AuthenticatedRequest {
  return 'user' in request && request.user !== undefined;
}
