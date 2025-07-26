import { redirect } from 'next/navigation';
import { verifyServerAuth } from '@/lib/server-auth';
import LoginForm from './login-form';

export default async function LoginPage() {
  // ตรวจสอบว่า user login แล้วหรือยัง
  const user = await verifyServerAuth();
  if (user) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}
