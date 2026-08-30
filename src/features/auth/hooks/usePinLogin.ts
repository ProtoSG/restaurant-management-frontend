import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { roleHome } from '../roleHome';

export function usePinLogin() {
  const navigate = useNavigate();
  const { signinWithPin, isAuthenticated, loading, errors, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(roleHome(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handlePinLogin = async (userId: number, pin: string) => {
    await signinWithPin(userId, pin);
  };

  return {
    handlePinLogin,
    isAuthenticated,
    loading,
    // Consumido directamente por PinPad (no como toast) — el error tiene que aparecer
    // pegado al teclado, no en un toast que puede pasar desapercibido en una tablet.
    error: errors[0] ?? null,
    clearError: () => useAuthStore.setState({ errors: [] }),
  };
}
