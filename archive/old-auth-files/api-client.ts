// API Client สำหรับจัดการ JWT Bearer Token
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.loadTokenFromStorage();
  }

  // โหลด token จาก localStorage
  private loadTokenFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth-token');
    }
  }

  // เซฟ token ลง localStorage
  private saveTokenToStorage(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }
    this.token = token;
  }

  // ลบ token จาก localStorage
  private removeTokenFromStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
    this.token = null;
  }

  // สร้าง headers พร้อม Bearer Token
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // ถ้า token หมดอายุ ให้ logout
      if (response.status === 401) {
        this.logout();
        throw new Error(data.error || 'Authentication failed');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request error:', error);
      throw error;
    }
  }

  // Login method
  async login(email: string, password: string): Promise<any> {
    try {
      const response = await this.request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.data.token) {
        this.saveTokenToStorage(response.data.token);
        return response;
      }

      throw new Error(response.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register method
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<any> {
    try {
      const response = await this.request<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          first_name: userData.firstName,
          last_name: userData.lastName,
        }),
      });

      if (response.success && response.data.token) {
        this.saveTokenToStorage(response.data.token);
        return response;
      }

      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  // Logout method
  async logout(): Promise<void> {
    try {
      // เรียก logout API (optional)
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // ลบ token ออกจาก storage
      this.removeTokenFromStorage();
    }
  }

  // Get current user profile
  async getProfile(): Promise<any> {
    return this.request('/profile');
  }

  // Get current user info
  async getCurrentUser(): Promise<any> {
    return this.request('/auth/me');
  }

  // Admin dashboard data
  async getAdminDashboard(): Promise<any> {
    return this.request('/admin/dashboard');
  }

  // Check if user is logged in
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Manual token setting
  setToken(token: string): void {
    this.saveTokenToStorage(token);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export default ApiClient;
