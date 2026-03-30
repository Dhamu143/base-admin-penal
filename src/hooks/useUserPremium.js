import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

// ── API FUNCTIONS ──────────────────────────────────────────

const fetchUserPremiumListApi = async (params = {}) => {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = queryString ? `/premium/admin/users?${queryString}` : "/premium/admin/users";

  const response = await httpService.get(url);
  const apiData = response.data;

  if (apiData?.data?.data && Array.isArray(apiData.data.data)) {
    return apiData.data;
  }
  if (apiData?.data && Array.isArray(apiData.data)) {
    return { data: apiData.data, pagination: apiData.pagination || null };
  }
  if (Array.isArray(apiData)) {
    return { data: apiData, pagination: null };
  }
  return { data: [], pagination: null };
};

const fetchUserPremiumHistoryApi = async (userId) => {
  const response = await httpService.get(`/premium/admin/history/${userId}`);
  return response.data?.data || [];
};

const grantPremiumApi = async (data) => {
  const response = await httpService.post("/premium/admin/grant", {}, data);
  return response.data;
};

const cancelPremiumApi = async (userId) => {
  const response = await httpService.delete(`/premium/admin/cancel/${userId}`);
  return response.data;
};

// ── HOOKS ──────────────────────────────────────────────────

export const useUserPremiumList = (filters = {}) => {
  return useQuery({
    queryKey: ["userPremiumList", filters],
    queryFn: () => fetchUserPremiumListApi(filters),
    staleTime: 0,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useUserPremiumHistory = (userId) => {
  return useQuery({
    queryKey: ["userPremiumHistory", userId],
    queryFn: () => fetchUserPremiumHistoryApi(userId),
    enabled: !!userId,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useGrantPremium = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: grantPremiumApi,
    onSuccess: () => {
      toast.success("Premium granted successfully!");
      queryClient.invalidateQueries({ queryKey: ["userPremiumList"] });
      queryClient.invalidateQueries({ queryKey: ["userPremiumHistory"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to grant premium");
    },
  });
};

export const useCancelPremium = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelPremiumApi,
    onSuccess: () => {
      toast.success("Premium cancelled successfully.");
      queryClient.invalidateQueries({ queryKey: ["userPremiumList"] });
      queryClient.invalidateQueries({ queryKey: ["userPremiumHistory"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to cancel premium");
    },
  });
};