import type { LoginRequest } from '../schemas/Login.schema';
import type { LoginResponse } from './Login';

export interface IAuthService {
  login(user: LoginRequest): Promise<{
    status: number;
    data: LoginResponse | { message: string };
  }>;
  logout(): Promise<void>;
  verifyAuth(): Promise<LoginResponse | null>;
}
