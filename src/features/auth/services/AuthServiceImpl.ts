import type { AxiosInstance } from 'axios';
import defaultApiClient from '@/shared/utils/apiClient';
import type { IAuthService } from '../types/IAuthService';
import type { LoginResponse, MeResponse, RegisterRequest } from '../types/Login';
import type { LoginRequest } from '../schemas/Login.schema';

export class AuthServiceImpl implements IAuthService {
  constructor(
    private readonly apiClient: AxiosInstance = defaultApiClient
  ) {}

  async login(user: LoginRequest) {
    const { data, status } = await this.apiClient.post<LoginResponse>('/auth/login', user);
    return { status, data };
  }

  async register(user: RegisterRequest) {
    const { data, status } = await this.apiClient.post<LoginResponse>('/auth/register', user);
    return { status, data };
  }

  async logout(): Promise<void> {
    await this.apiClient.post('/auth/logout', {});
  }

  async getMe(): Promise<MeResponse | null> {
    try {
      const { data } = await this.apiClient.get<MeResponse>('/auth/me');
      return data;
    } catch {
      return null;
    }
  }
}
