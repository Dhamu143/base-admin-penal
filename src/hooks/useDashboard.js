import { useQuery, useQueryClient } from "@tanstack/react-query";
import httpService from "../common/http.service";

const fetchDashboardStats = async () => {
  const response = await httpService.get("/dashboard-stats");
  return response.data.data;
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};