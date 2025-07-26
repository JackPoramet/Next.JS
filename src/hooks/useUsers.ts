import { useState, useEffect } from 'react';

// TypeScript interfaces
export interface User {
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

export interface UsersStats {
  totalUsers: number;
  activeUsers: number;
  admins: number;
  newThisMonth: number;
}

export interface UsersResponse {
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

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UsersStats>({
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
    newThisMonth: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[DEBUG] useUsers - Fetching users from API');
      
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
      });

      const data: UsersResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      if (data.success) {
        console.log('[DEBUG] useUsers - Users fetched successfully:', data.data.users.length);
        setUsers(data.data.users);
        setStats({
          totalUsers: data.data.totalUsers,
          activeUsers: data.data.activeUsers,
          admins: data.data.admins,
          newThisMonth: data.data.newThisMonth
        });
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[ERROR] useUsers - Failed to fetch users:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUsers = () => {
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    stats,
    isLoading,
    error,
    refreshUsers,
    fetchUsers
  };
}
