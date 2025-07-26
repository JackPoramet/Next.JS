export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}
