import { requireAuth } from '@/lib/auth';
import { logoutAction } from '@/lib/actions';

export default async function DashboardPage() {
  // ตรวจสอบ authentication (จะ redirect ไป login ถ้าไม่ได้ login)
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">IoT Electric Energy Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">สวัสดี, {user.email}</span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  ออกจากระบบ
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🎉 ยินดีต้อนรับสู่ Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                คุณได้เข้าสู่ระบบสำเร็จแล้ว! ระบบ Authentication ทำงานได้อย่างสมบูรณ์
              </p>
              
              <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-4">ข้อมูลผู้ใช้</h3>
                <div className="space-y-2 text-left">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>อีเมล:</strong> {user.email}</p>
                  <p><strong>ชื่อ:</strong> {user.first_name || 'ไม่ระบุ'}</p>
                  <p><strong>นามสกุล:</strong> {user.last_name || 'ไม่ระบุ'}</p>
                  <p><strong>บทบาท:</strong> {user.role}</p>
                </div>
              </div>

              <div className="mt-8 text-sm text-gray-500">
                <p>✅ Server-side Authentication</p>
                <p>✅ Cookie-based Session Management</p>
                <p>✅ Next.js App Router + Server Actions</p>
                <p>✅ Automatic Redirects</p>
              </div>
              
              <div className="mt-6 space-x-4">
                <a 
                  href="/debug-auth" 
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Debug Auth
                </a>
                <a 
                  href="/test-auth" 
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Test Auth
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
