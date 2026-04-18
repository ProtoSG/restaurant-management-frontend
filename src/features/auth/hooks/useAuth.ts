import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    errors: store.errors,
    loading: store.loading,
    signin: store.signin,
    logout: store.logout,
    verifyAuth: store.verifyAuth,
  };
};
