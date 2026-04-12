import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import type { RoleName } from '../types/Login';

const ROLE_HOME: Record<RoleName, string> = {
  ADMIN:   '/',
  CASHIER: '/orders',
  WAITER:  '/tables',
  CHEF:    '/orders',
};

export function useLogin() {
  const navigate = useNavigate();
  const { signin, isAuthenticated, loading, errors, logout, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      const destination = user.role ? ROLE_HOME[user.role] : '/';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (errors.length > 0) {
      errors.forEach((error) => {
        toast.error(error);
      });
    }
  }, [errors]);

  const handleLogin = async (data: { username: string; password: string }) => {
    await signin(data);
  };

  return {
    handleLogin,
    isAuthenticated,
    loading,
    logout,
    user
  };
}
