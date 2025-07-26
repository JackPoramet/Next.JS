# 🔐 Authentication System with Zustand

ระบบ JWT Bearer Authorization ที่ใช้ Zustand สำหรับ state management

## 🏗️ Architecture

```
src/
├── store/
│   └── authStore.ts          # Zustand auth store
├── types/
│   └── auth.ts              # TypeScript interfaces
├── lib/
│   └── cookies.ts           # Cookie utilities
└── app/
    ├── page.tsx             # Home page (redirect logic)
    ├── login/
    │   ├── page.tsx         # Login page
    │   └── login-form.tsx   # Login form component
    └── dashboard/
        └── page.tsx         # Protected dashboard
```

## 🎯 Zustand Store Features

### State Management
```typescript
interface AuthState {
  user: User | null;           // ข้อมูล user
  token: string | null;        // JWT token
  isLoading: boolean;          // Loading state
  error: string | null;        // Error messages
  isAuthenticated: boolean;    // Computed value
}
```

### Actions
```typescript
- login(credentials)         // เข้าสู่ระบบ
- logout()                   // ออกจากระบบ
- checkAuth()               // ตรวจสอบ authentication
- clearError()              // ลบ error message
- setLoading(boolean)       // ตั้งค่า loading state
```

## 🚀 Usage Examples

### 1. Login Component
```typescript
import { useAuth } from '@/store/authStore';

function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth();
  
  const handleSubmit = async (e) => {
    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (error) {
      // Error จัดการใน store แล้ว
    }
  };
}
```

### 2. Protected Page
```typescript
import { useAuth } from '@/store/authStore';

function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated]);
}
```

### 3. Navigation Component
```typescript
function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>สวัสดี, {user?.email}</span>
          <button onClick={logout}>ออกจากระบบ</button>
        </>
      ) : (
        <Link href="/login">เข้าสู่ระบบ</Link>
      )}
    </nav>
  );
}
```

## 🔧 Features

### ✅ Implemented
- JWT Bearer Authentication
- Zustand State Management
- Cookie-based Token Storage
- Type Safety with TypeScript
- Error Handling
- Loading States
- Persistent Auth State
- Auto-redirect Logic

### 🎯 Benefits of Zustand
1. **Minimal Boilerplate** - น้อยกว่า Redux/Context
2. **TypeScript Support** - Type safety ครบถ้วน
3. **Devtools Integration** - Debug ง่าย
4. **Persistence** - เก็บ state อัตโนมัติ
5. **No Providers** - ไม่ต้อง wrap components
6. **Computed Values** - Selectors สะดวก

## 🛡️ Security

- **HttpOnly Cookies** สำหรับ production
- **Token Expiration** - Auto cleanup
- **CSRF Protection** - SameSite cookies
- **Client/Server Separation** - Clear boundaries

## 📱 Responsive Design

- Mobile-first approach
- Loading spinners
- Error messages
- Form validation

## 🚀 Next Steps

1. **Token Refresh** - Auto refresh expired tokens
2. **Role-based Access** - Permission system
3. **Multi-factor Auth** - Enhanced security
4. **Social Login** - OAuth integration

## 🧪 Testing

```bash
# การทดสอบ
1. เข้า http://localhost:3000
2. กรอก: admin@example.com / admin123
3. ตรวจสอบ redirect ไป dashboard
4. ทดสอบ logout
5. ตรวจสอบ browser refresh (persistent state)
```

## 📚 Learn More

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Next.js App Router](https://nextjs.org/docs/app)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
