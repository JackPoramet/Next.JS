import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// Interface สำหรับข้อมูลใน JWT Token
export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// ฟังก์ชันสำหรับสร้าง JWT Token
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  // สร้าง token ที่มีอายุ 24 ชั่วโมง
  return jwt.sign(payload, secret, {
    expiresIn: '24h',
    issuer: 'iot-electric-energy-app',
  });
};

// ฟังก์ชันสำหรับ verify JWT Token
export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

// ฟังก์ชันสำหรับดึง token จาก request headers
export const extractTokenFromRequest = (request: NextRequest): string | null => {
  // ตรวจสอบ Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // ตัด "Bearer " ออก
  }

  // ตรวจสอบ cookies
  const tokenFromCookie = request.cookies.get('auth-token')?.value;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  return null;
};

// Middleware function สำหรับ authentication
export const authenticateToken = (request: NextRequest): { isAuthenticated: boolean; user?: JWTPayload; error?: string } => {
  try {
    const token = extractTokenFromRequest(request);
    
    if (!token) {
      return {
        isAuthenticated: false,
        error: 'No token provided'
      };
    }

    const user = verifyToken(token);
    
    return {
      isAuthenticated: true,
      user
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    };
  }
};

// ฟังก์ชันสำหรับตรวจสอบ role ของ user
export const authorizeRole = (user: JWTPayload, allowedRoles: string[]): boolean => {
  return allowedRoles.includes(user.role);
};
