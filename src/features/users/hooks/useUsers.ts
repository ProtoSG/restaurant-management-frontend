import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserServiceImpl } from "../services/UserServiceImpl";
import type { CreateUserRequest, UpdateUserRequest } from "../types/User";

const userService = new UserServiceImpl();
const DEFAULT_SIZE = 20;

export function useUsers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", { page, size: DEFAULT_SIZE }],
    queryFn: () => userService.getAll(page, DEFAULT_SIZE),
  });

  const createMutation = useMutation({
    mutationFn: (req: CreateUserRequest) => userService.create(req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: UpdateUserRequest }) =>
      userService.update(id, req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => userService.toggleActive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  return {
    users: data?.content ?? [],
    isLoading,
    error,
    page,
    setPage,
    pagination: data ? {
      totalElements: data.totalElements,
      totalPages: data.totalPages,
    } : { totalElements: 0, totalPages: 0 },
    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    toggleActive: toggleMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isTogglingId: toggleMutation.isPending ? toggleMutation.variables : null,
    isDeletingId: deleteMutation.isPending ? deleteMutation.variables : null,
  };
}
