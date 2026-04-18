import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthServiceImpl } from '../services/AuthServiceImpl';
import type { LoginResponse } from '../types/Login';
import type { LoginRequest } from '../schemas/Login.schema';

interface AuthState {
  user            : LoginResponse | null;
  isAuthenticated : boolean;
  errors          : string[];
  loading         : boolean;
  signin          : (user: LoginRequest) => Promise<void>;
  logout          : () => Promise<void>;
  verifyAuth      : () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      errors: [],
      loading: true,

      verifyAuth: async () => {
        try {
          set({ loading: true });
          const userData = await new AuthServiceImpl().verifyAuth();
          set({
            user: userData,
            isAuthenticated: !!userData,
            loading: false
          });
        } catch {
          set({ loading: false });
        }
      },

      signin: async (credentials) => {
        set({ loading: true, errors: [] });
        try {
          const { status, data } = await new AuthServiceImpl().login(credentials);

          if (status >= 200 && status < 300 && data && !('message' in data)) {
            set({ user: data as LoginResponse, isAuthenticated: true, loading: false });
          } else if (data && 'message' in data) {
            set({ errors: [(data as { message: string }).message], loading: false });
          } else {
            set({ errors: ['Ocurrió un error desconocido al iniciar sesión.'], loading: false });
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Error inesperado al conectar con el servidor';
          set({ errors: [message], loading: false });
        }
      },

      logout: async () => {
        try {
          await new AuthServiceImpl().logout();
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
