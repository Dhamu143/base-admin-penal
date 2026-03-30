import { useQuery, keepPreviousData } from "@tanstack/react-query";
import httpService from "../common/http.service"; // Ensure this path is correct
import { toast } from "react-toastify";

// ─── API FUNCTIONS ────────────────────────────────────────────────────────

const fetchOrdersApi = async (params = {}) => {
  // Clean up undefined/null/empty parameters
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = queryString ? `/order/all?${queryString}` : "/order/all";

  const response = await httpService.get(url);
  const apiData = response.data;

  // Handle standard { success: true, data: [...] } format
  if (apiData?.data && Array.isArray(apiData.data)) {
    return { 
      data: apiData.data, 
      pagination: apiData.pagination || null 
    };
  }

  if (Array.isArray(apiData)) {
    return { data: apiData, pagination: null };
  }

  return { data: [], pagination: null };
};

// ─── HOOKS ────────────────────────────────────────────────────────────────

export const useOrders = (filters) => {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => fetchOrdersApi(filters),
    staleTime: 0,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};