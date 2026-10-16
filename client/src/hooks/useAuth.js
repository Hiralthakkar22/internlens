import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

// The logged in user is just another query. null = guest.
export function useUser() {
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/auth/me").then((d) => d.user),
    staleTime: 5 * 60 * 1000,
  });
  return { user: data ?? null, isLoading };
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post("/auth/login", body),
    onSuccess: ({ user }) => {
      qc.setQueryData(["me"], user);
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] !== "me" }); // refresh upvoted/saved flags
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post("/auth/register", body),
    onSuccess: ({ user }) => qc.setQueryData(["me"], user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSuccess: () => {
      qc.setQueryData(["me"], null);
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "me" });
    },
  });
}
