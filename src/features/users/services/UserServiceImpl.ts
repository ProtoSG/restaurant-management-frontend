import defaultApiClient from "@/shared/utils/apiClient";
import type { User, CreateUserRequest, UpdateUserRequest } from "../types/User";
import type { PaginatedResponse } from "@/shared/types/PaginatedResponse";

export class UserServiceImpl {
  async getAll(page = 0, size = 20): Promise<PaginatedResponse<User>> {
    const { data } = await defaultApiClient.get<PaginatedResponse<User>>("/users", { params: { page, size } });
    return data;
  }

  async create(req: CreateUserRequest): Promise<User> {
    const { data } = await defaultApiClient.post<User>("/users", req);
    return data;
  }

  async update(id: number, req: UpdateUserRequest): Promise<User> {
    const { data } = await defaultApiClient.put<User>(`/users/${id}`, req);
    return data;
  }

  async toggleActive(id: number): Promise<User> {
    const { data } = await defaultApiClient.patch<User>(`/users/${id}/toggle`);
    return data;
  }

  async delete(id: number): Promise<void> {
    await defaultApiClient.delete(`/users/${id}`);
  }
}
