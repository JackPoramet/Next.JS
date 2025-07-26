import { NextRequest, NextResponse } from 'next/server';

// กำหนด protected และ public routes
const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/login', '/register', '/', '/debug-auth', '/test-auth', '/cookie-test'];

export default async function middleware(req: NextRequest) {
  // ดึง path ปัจจุบัน
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // ตรวจสอบ auth token จาก cookie
  const token = req.cookies.get('auth-token')?.value;
  
  console.log('🔒 Middleware:', path, token ? '✅ Has token' : '❌ No token');
  
  // ถ้าเป็น protected route และไม่มี token ให้ redirect ไป login
  if (isProtectedRoute && !token) {
    console.log('🚫 Redirecting to login');
    return NextResponse.redirect(new URL(`/login?from=${path}`, req.nextUrl));
  }

  // ถ้าเป็น login page และมี token แล้ว ให้ redirect ไป dashboard
  if (path === '/login' && token) {
    console.log('✅ Redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}

// กำหนดว่า middleware จะทำงานกับ routes ไหนบ้าง
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
