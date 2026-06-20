import type { RoleName } from "@/features/auth/types/Login";

export interface User {
  id: number;
  name: string;
  username: string;
  role: RoleName;
  isActive: boolean;
}

export interface CreateUserRequest {
  name: string;
  username: string;
  password: string;
  role: RoleName;
}

export interface UpdateUserRequest {
  name: string;
  role: RoleName;
}
