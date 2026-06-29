export type RoleName = 'ADMIN' | 'CASHIER' | 'CHEF' | 'WAITER';

export interface LoginResponse {
  username: string;
  role: RoleName;
}

export interface MeResponse {
  id: number;
  name: string;
  username: string;
  role: RoleName;
}

export interface RegisterRequest {
  name: string;
  username: string;
  password: string;
  role: RoleName;
}
