'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Cookie helpers
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const cookieValue = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure=${window.location.protocol === 'https:'}`;
  document.cookie = cookieValue;
  console.log('🍪 Cookie set:', cookieValue);
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  console.log('🗑️ Cookie deleted:', name);
};

// Interface สำหรับ User
interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

// Interface สำหรับ AuthContext
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// สร้าง Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ฟังก์ชันตรวจสอบสถานะ authentication
  const checkAuthStatus = async () => {
    try {
      // ตรวจสอบ token ใน cookie ก่อน แล้วค่อย fallback ไป localStorage
      let token = getCookie('auth-token');
      if (!token) {
        token = localStorage.getItem('auth-token');
        if (token) {
          // ย้ายจาก localStorage ไป cookie
          setCookie('auth-token', token);
          localStorage.removeItem('auth-token');
        }
      }
      
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();

      if (data.success && data.data.user) {
        setUser(data.data.user);
      } else {
        // Token ไม่ valid ให้ลบออก
        deleteCookie('auth-token');
        localStorage.removeItem('auth-token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      deleteCookie('auth-token');
      localStorage.removeItem('auth-token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชัน login
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.data.user) {
        // เก็บ token ใน cookie และ localStorage สำหรับการใช้งาน API
        if (data.data.token) {
          console.log('💾 Storing token:', data.data.token.substring(0, 20) + '...');
          setCookie('auth-token', data.data.token, 7); // เก็บใน cookie 7 วัน
          localStorage.setItem('auth-token', data.data.token); // backup ใน localStorage
          
          // Verify cookie was set
          setTimeout(() => {
            const cookieCheck = getCookie('auth-token');
            console.log('🔍 Cookie verification:', !!cookieCheck);
          }, 100);
        }
        
        setUser(data.data.user);
        console.log('👤 User set:', data.data.user.email);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  // ฟังก์ชัน register
  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      const data = await response.json();

      if (data.success && data.data.user) {
        // เก็บ token ใน localStorage สำหรับการใช้งาน API
        if (data.data.token) {
          localStorage.setItem('auth-token', data.data.token);
        }
        
        setUser(data.data.user);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  // ฟังก์ชัน logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // ลบ token ออกจาก cookie และ localStorage
      deleteCookie('auth-token');
      localStorage.removeItem('auth-token');
      setUser(null);
      // สำหรับ logout ใช้ window.location.href เพื่อ clear ทุกอย่าง
      window.location.href = '/login';
    }
  };

  // ฟังก์ชัน refresh user data
  const refreshUser = async () => {
    await checkAuthStatus();
  };

  // ตรวจสอบสถานะ authentication เมื่อ component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook สำหรับใช้ AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC สำหรับ protect components
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังเปลี่ยนเส้นทาง...</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
