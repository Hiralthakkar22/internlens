import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // data is "fresh" for a minute, no refetch on every page visit
      refetchOnWindowFocus: false,
      retry: (count, error) => error?.status >= 500 && count < 2, // don't retry 401/404
    },
  },
});
