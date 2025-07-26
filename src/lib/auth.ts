import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// ค่าคงที่สำหรับ salt rounds (ยิ่งสูงยิ่งปลอดภัย แต่ช้ากว่า)
const SALT_ROUNDS = 12;

/**
 * ฟังก์ชันสำหรับ hash password
 * @param password - รหัสผ่านที่ต้องการ hash
 * @returns Promise<string> - รหัสผ่านที่ hash แล้ว
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    // สร้าง salt และ hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * ฟังก์ชันสำหรับเปรียบเทียบ password กับ hash
 * @param password - รหัสผ่านที่ผู้ใช้ป้อน
 * @param hashedPassword - รหัสผ่านที่ hash แล้วใน database
 * @returns Promise<boolean> - true ถ้า password ตรงกัน
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Error comparing password:', error);
    throw new Error('Failed to compare password');
  }
};

/**
 * ฟังก์ชันสำหรับตรวจสอบความแข็งแกร่งของ password
 * @param password - รหัสผ่านที่ต้องการตรวจสอบ
 * @returns object ที่บอกว่า password แข็งแกร่งหรือไม่ และข้อความแนะนำ
 */
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  // ตรวจสอบความยาวขั้นต่ำ
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long'
    };
  }

  // ตรวจสอบว่ามีตัวอักษรใหญ่
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }

  // ตรวจสอบว่ามีตัวอักษรเล็ก
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }

  // ตรวจสอบว่ามีตัวเลข
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }

  // ตรวจสอบว่ามีอักขระพิเศษ
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character'
    };
  }

  return {
    isValid: true,
    message: 'Password is strong'
  };
}

// Server-side auth functions
export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value || null;
}

export async function setAuthToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: false, // ต้องเป็น false เพื่อให้ client อ่านได้
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function removeAuthToken() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

export async function verifyAuth() {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  try {
    // ตรวจสอบ token กับ API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (data.success && data.data.user) {
      return data.data.user;
    }
    
    return null;
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await verifyAuth();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function redirectIfAuthenticated() {
  const user = await verifyAuth();
  if (user) {
    redirect('/dashboard');
  }
};
