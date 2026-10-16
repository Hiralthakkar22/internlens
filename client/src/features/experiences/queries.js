import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, toQuery } from "../../lib/api";

export function useExperiences(params) {
  return useQuery({
    queryKey: ["experiences", params],
    queryFn: () => api.get("/experiences" + toQuery(params)),
    placeholderData: keepPreviousData, // keep old page visible while the next one loads
  });
}

export function useExperience(id) {
  return useQuery({
    queryKey: ["experience", id],
    queryFn: () => api.get(`/experiences/${id}`).then((d) => d.experience),
    enabled: Boolean(id),
  });
}

export function useMyExperiences() {
  return useQuery({
    queryKey: ["experiences", "mine"],
    queryFn: () => api.get("/experiences/mine").then((d) => d.items),
  });
}

export function useSavedExperiences() {
  return useQuery({
    queryKey: ["experiences", "saved"],
    queryFn: () => api.get("/users/me/saved").then((d) => d.items),
  });
}

// Changes one experience everywhere it is cached (lists, detail page, saved page),
// so the button updates instantly without refetching everything.
function patchEverywhere(qc, id, change) {
  const update = (exp) => (exp?.id === id ? { ...exp, ...change(exp) } : exp);
  qc.setQueriesData({ queryKey: ["experiences"] }, (old) => {
    if (!old) return old;
    if (Array.isArray(old)) return old.map(update);
    if (old.items) return { ...old, items: old.items.map(update) };
    return old;
  });
  qc.setQueryData(["experience", id], (old) => (old ? update(old) : old));
}

export function useUpvote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/experiences/${id}/upvote`),
    // optimistic update: change the UI first, fix it if the server says no
    onMutate: (id) => {
      patchEverywhere(qc, id, (e) => ({
        upvotedByMe: !e.upvotedByMe,
        upvoteCount: e.upvoteCount + (e.upvotedByMe ? -1 : 1),
      }));
    },
    onSuccess: ({ upvoted, upvoteCount }, id) => {
      patchEverywhere(qc, id, () => ({ upvotedByMe: upvoted, upvoteCount }));
    },
    onError: (err, id) => {
      patchEverywhere(qc, id, (e) => ({
        upvotedByMe: !e.upvotedByMe,
        upvoteCount: e.upvoteCount + (e.upvotedByMe ? -1 : 1),
      }));
      toast.error(err.message);
    },
  });
}

export function useToggleSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/users/me/saved/${id}`),
    onSuccess: ({ saved }, id) => {
      patchEverywhere(qc, id, () => ({ savedByMe: saved }));
      qc.invalidateQueries({ queryKey: ["experiences", "saved"] });
      toast.success(saved ? "Saved for later" : "Removed from saved");
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useSaveExperience(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => (id ? api.put(`/experiences/${id}`, body) : api.post("/experiences", body)),
    onSuccess: ({ experience }) => {
      qc.invalidateQueries({ queryKey: ["experiences"] });
      qc.invalidateQueries({ queryKey: ["companies"] });
      qc.invalidateQueries({ queryKey: ["company"] });
      qc.invalidateQueries({ queryKey: ["insights"] });
      qc.setQueryData(["experience", experience.id], experience);
    },
  });
}

export function useDeleteExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.del(`/experiences/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["experiences"] });
      qc.invalidateQueries({ queryKey: ["companies"] });
      qc.invalidateQueries({ queryKey: ["company"] });
      qc.invalidateQueries({ queryKey: ["insights"] });
      toast.success("Experience deleted");
    },
    onError: (err) => toast.error(err.message),
  });
}
