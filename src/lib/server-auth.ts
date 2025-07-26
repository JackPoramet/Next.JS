import { cookies } from 'next/headers';

export async function getServerAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value || null;
}

export async function setServerAuthToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function removeServerAuthToken() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

export async function verifyServerAuth() {
  const token = await getServerAuthToken();
  if (!token) {
    return null;
  }

  try {
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
