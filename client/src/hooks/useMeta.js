import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

// Dropdown lists (role types, rounds, topics...) come from the server,
// so the form and the validation can never disagree.
export function useMeta() {
  const { data } = useQuery({
    queryKey: ["meta"],
    queryFn: () => api.get("/meta"),
    staleTime: Infinity,
  });
  return (
    data ?? {
      ROLE_TYPES: [],
      ROUND_TYPES: [],
      TOPICS: [],
      SOURCES: [],
      WORK_MODES: [],
      OUTCOMES: [],
      DIFFICULTY: [],
    }
  );
}
