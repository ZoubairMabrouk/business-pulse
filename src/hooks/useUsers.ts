import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UsersService } from "@/services/usersService";
import type {
  CreateUserPayload,
  ResetPasswordPayload,
  UpdateUserPayload,
  UsersListParams,
} from "@/types/user";

export const usersKeys = {
  all: ["users"] as const,
  list: (p: UsersListParams) => ["users", "list", p] as const,
  detail: (id: string) => ["users", "detail", id] as const,
};

export function useUsersList(params: UsersListParams) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => UsersService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: usersKeys.detail(id ?? ""),
    queryFn: () => UsersService.get(id as string),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => UsersService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      UsersService.update(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: usersKeys.all });
      qc.invalidateQueries({ queryKey: usersKeys.detail(vars.id) });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => UsersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
}

export function useSetUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "Active" | "Inactive" }) =>
      UsersService.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: usersKeys.all }),
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResetPasswordPayload }) =>
      UsersService.resetPassword(id, payload),
  });
}