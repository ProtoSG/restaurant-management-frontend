import type { LoginRequest } from '../schemas/Login.schema';
import type { LoginResponse, MeResponse, PinLoginCandidate, RegisterRequest } from './Login';

export interface IAuthService {
  login(user: LoginRequest): Promise<{
    status: number;
    data: LoginResponse | { message: string };
  }>;
  register(user: RegisterRequest): Promise<{
    status: number;
    data: LoginResponse | { message: string };
  }>;
  logout(): Promise<void>;
  getMe(): Promise<MeResponse | null>;
  getPinLoginCandidates(): Promise<PinLoginCandidate[]>;
  pinLogin(userId: number, pin: string): Promise<{
    status: number;
    data: LoginResponse | { message: string };
  }>;
}
