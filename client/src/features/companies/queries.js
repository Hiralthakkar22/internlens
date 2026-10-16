import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api, toQuery } from "../../lib/api";

export function useCompanies(params) {
  return useQuery({
    queryKey: ["companies", params],
    queryFn: () => api.get("/companies" + toQuery(params)),
    placeholderData: keepPreviousData,
  });
}

export function useCompany(slug) {
  return useQuery({
    queryKey: ["company", slug],
    queryFn: () => api.get(`/companies/${slug}`),
  });
}

export function useCompanySearch(q) {
  return useQuery({
    queryKey: ["companies", "search", q],
    queryFn: () => api.get("/companies/search" + toQuery({ q })).then((d) => d.items),
    enabled: q.trim().length > 0,
    staleTime: 30 * 1000,
  });
}

export function useCities() {
  return useQuery({
    queryKey: ["companies", "cities"],
    queryFn: () => api.get("/companies/cities").then((d) => d.items),
    staleTime: 10 * 60 * 1000,
  });
}

export function useOverview() {
  return useQuery({
    queryKey: ["insights", "overview"],
    queryFn: () => api.get("/insights/overview"),
  });
}
