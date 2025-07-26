import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials } from '@/types/auth';
import { getCookie, setCookie, removeCookie } from '@/lib/cookies';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isLoading: true,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        console.log('[DEBUG] AuthStore - Login started');
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          console.log('[DEBUG] AuthStore - Response status:', response.status);
          const data = await response.json();
          console.log('[DEBUG] AuthStore - Response data:', data);

          if (data.success && data.data.token) {
            console.log('[DEBUG] AuthStore - Login successful');
            
            // Store in state
            set({ 
              user: data.data.user, 
              token: data.data.token,
              isLoading: false,
              error: null
            });
            
            console.log('[DEBUG] AuthStore - User and token stored in state');
          } else {
            console.log('[DEBUG] AuthStore - Login failed:', data.message);
            set({ 
              error: data.message || 'เข้าสู่ระบบไม่สำเร็จ',
              isLoading: false 
            });
            throw new Error(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
          }
        } catch (error) {
          console.error('[DEBUG] AuthStore - Login error:', error);
          const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw error;
        }
      },

      logout: () => {
        console.log('[DEBUG] AuthStore - Logout');
        
        // Remove cookie
        removeCookie('auth-token');
        
        // Clear state
        set({ 
          user: null, 
          token: null, 
          error: null,
          isLoading: false
        });
        
        console.log('[DEBUG] AuthStore - Logout completed');
      },

      checkAuth: async () => {
        console.log('[DEBUG] AuthStore - Checking authentication');
        set({ isLoading: true });
        
        try {
          // Check cookie first
          const cookieToken = getCookie('auth-token');
          console.log('[DEBUG] AuthStore - Cookie token:', cookieToken);
          
          if (!cookieToken) {
            console.log('[DEBUG] AuthStore - No token found');
            set({ isLoading: false });
            return;
          }

          // For now, use mock user data
          // In the future, you can call an API to verify the token
          console.log('[DEBUG] AuthStore - Token found, setting mock user');
          set({
            user: {
              id: 1,
              email: 'admin@example.com',
              first_name: 'Admin',
              last_name: 'User',
              role: 'admin'
            },
            token: cookieToken,
            isLoading: false,
            error: null
          });
          
          console.log('[DEBUG] AuthStore - Auth check completed successfully');
        } catch (error) {
          console.error('[DEBUG] AuthStore - Auth check error:', error);
          set({ 
            user: null, 
            token: null, 
            isLoading: false,
            error: 'ตรวจสอบการเข้าสู่ระบบไม่สำเร็จ'
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      // Only persist non-sensitive data
      partialize: (state) => ({ 
        user: state.user,
        // Don't persist token - use cookie instead
      }),
    }
  )
);

// Computed values (selectors)
export const useAuth = () => {
  const store = useAuthStore();
  return {
    ...store,
    isAuthenticated: !!store.user && !!store.token,
  };
};
