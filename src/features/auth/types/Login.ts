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

/** Una entrada del selector de nombre para login por PIN — sin datos sensibles. */
export interface PinLoginCandidate {
  id: number;
  name: string;
}
