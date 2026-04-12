export type RoleName = 'ADMIN' | 'CASHIER' | 'CHEF' | 'WAITER';

export interface LoginResponse {
  username: string;
  role?: RoleName;
  token?: string;
}
