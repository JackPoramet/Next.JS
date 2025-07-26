'use server';

import { redirect } from 'next/navigation';
import { setServerAuthToken, removeServerAuthToken } from '@/lib/server-auth';

export async function loginAction(formData: FormData) {
  console.log('[DEBUG] loginAction started');
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  console.log('[DEBUG] loginAction - Email:', email);
  console.log('[DEBUG] loginAction - Password length:', password?.length);

  if (!email || !password) {
    console.log('[DEBUG] loginAction - Missing email or password');
    return { error: 'กรุณากรอกอีเมลและรหัสผ่าน' };
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const fullUrl = `${apiUrl}/api/auth/login`;
    
    console.log('[DEBUG] loginAction - API URL:', fullUrl);
    console.log('[DEBUG] loginAction - Making fetch request...');
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('[DEBUG] loginAction - Response status:', response.status);
    console.log('[DEBUG] loginAction - Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('[DEBUG] loginAction - Response data:', data);

    if (data.success && data.data.token) {
      console.log('[DEBUG] loginAction - Login successful, setting token...');
      // เก็บ token ใน cookie ผ่าน server-side
      await setServerAuthToken(data.data.token);
      
      console.log('[DEBUG] loginAction - Token set, redirecting to dashboard...');
      // Redirect ไป dashboard
      redirect('/dashboard');
    } else {
      console.log('[DEBUG] loginAction - Login failed:', data.message);
      return { error: data.message || 'เข้าสู่ระบบไม่สำเร็จ' };
    }
  } catch (error) {
    console.error('[DEBUG] loginAction - Catch block error:', error);
    console.error('[DEBUG] loginAction - Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return { error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
  }
}

export async function logoutAction() {
  await removeServerAuthToken();
  redirect('/login');
}
