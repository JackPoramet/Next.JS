// User API client functions

interface CreateUserData {
  name: string;
  email: string;
  role: string;
  status: string;
  password: string;
  confirmPassword: string;
}

interface UpdateUserData {
  name: string;
  email: string;
  role: string;
  status: string;
  password?: string;
  confirmPassword?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: string;
}

interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    totalUsers: number;
    activeUsers: number;
    admins: number;
    newThisMonth: number;
  };
}

interface UserResponse {
  success: boolean;
  message: string;
  data: User;
}

interface ApiResponse {
  success: boolean;
  message: string;
  error?: string;
}

// Get authentication token from cookies
function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
  
  if (tokenCookie) {
    return tokenCookie.split('=')[1];
  }
  
  return null;
}

// Create headers with authentication
function createHeaders(): HeadersInit {
  const token = getAuthToken();
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Handle API response
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  
  if (!data.success) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
}

export const userAPI = {
  // Get all users
  async getAllUsers(): Promise<UsersResponse> {
    try {
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: createHeaders(),
      });

      return await handleResponse<UsersResponse>(response);
    } catch (error) {
      console.error('[ERROR] userAPI.getAllUsers:', error);
      throw error;
    }
  },

  // Get single user
  async getUser(id: number): Promise<UserResponse> {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'GET',
        headers: createHeaders(),
      });

      return await handleResponse<UserResponse>(response);
    } catch (error) {
      console.error('[ERROR] userAPI.getUser:', error);
      throw error;
    }
  },

  // Create new user
  async createUser(userData: CreateUserData): Promise<UserResponse> {
    try {
      // Parse name into firstName and lastName
      const nameParts = userData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const requestData = {
        email: userData.email,
        password: userData.password,
        firstName,
        lastName,
        role: userData.role
      };

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(requestData),
      });

      return await handleResponse<UserResponse>(response);
    } catch (error) {
      console.error('[ERROR] userAPI.createUser:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(id: number, userData: UpdateUserData): Promise<UserResponse> {
    try {
      const requestData = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        ...(userData.password && { password: userData.password })
      };

      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify(requestData),
      });

      return await handleResponse<UserResponse>(response);
    } catch (error) {
      console.error('[ERROR] userAPI.updateUser:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: createHeaders(),
      });

      return await handleResponse<ApiResponse>(response);
    } catch (error) {
      console.error('[ERROR] userAPI.deleteUser:', error);
      throw error;
    }
  }
};

export type { CreateUserData, UpdateUserData, User, UsersResponse, UserResponse, ApiResponse };
