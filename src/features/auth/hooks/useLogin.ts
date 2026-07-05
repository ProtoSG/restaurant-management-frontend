import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import { roleHome } from '../roleHome';

export function useLogin() {
  const navigate = useNavigate();
  const { signin, isAuthenticated, loading, errors, logout, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(roleHome(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      useAuthStore.setState({ errors: [] });
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
