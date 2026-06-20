import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthServiceImpl } from '../services/AuthServiceImpl';
import type { MeResponse } from '../types/Login';
import type { LoginRequest } from '../schemas/Login.schema';
import type { RegisterRequest } from '../types/Login';
import { getApiErrorMessage } from '@/shared/utils/apiError';

interface AuthState {
  user            : MeResponse | null;
  isAuthenticated : boolean;
  errors          : string[];
  loading         : boolean;
  signin          : (user: LoginRequest) => Promise<void>;
  register        : (user: RegisterRequest) => Promise<void>;
  logout          : () => Promise<void>;
  verifyAuth      : () => Promise<void>;
}

const authService = new AuthServiceImpl();

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      errors: [],
      loading: false,

      verifyAuth: async () => {
        try {
          set({ loading: true });
          const userData = await authService.getMe();
          if (userData) {
            set({ user: userData, isAuthenticated: true, loading: false });
          } else {
            set({ user: null, isAuthenticated: false, loading: false });
          }
        } catch {
          // Token expired or revoked — clear stale auth state
          set({ user: null, isAuthenticated: false, loading: false });
        }
      },

      signin: async (credentials) => {
        set({ loading: true, errors: [] });
        try {
          const { status } = await authService.login(credentials);

          if (status >= 200 && status < 300) {
            const meData = await authService.getMe();
            if (!meData) {
              set({ errors: ['Error al obtener perfil. Intenta de nuevo.'], loading: false });
              return;
            }
            set({ user: meData, isAuthenticated: true, loading: false });
          } else {
            set({ errors: ['Credenciales incorrectas'], loading: false });
          }
        } catch (err: unknown) {
          set({ errors: [getApiErrorMessage(err)], loading: false });
        }
      },

      register: async (registerData) => {
        set({ loading: true, errors: [] });
        try {
          const { status } = await authService.register(registerData);

          if (status >= 200 && status < 300) {
            const meData = await authService.getMe();
            if (!meData) {
              set({ errors: ['Error al obtener perfil. Intenta de nuevo.'], loading: false });
              return;
            }
            set({ user: meData, isAuthenticated: true, loading: false });
          } else {
            set({ errors: ['Error al registrar usuario'], loading: false });
          }
        } catch (err: unknown) {
          set({ errors: [getApiErrorMessage(err)], loading: false });
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
        } finally {
          set({ user: null, isAuthenticated: false, errors: [] });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);
