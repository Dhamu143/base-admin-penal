import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

// ── API FUNCTIONS ──────────────────────────────────────────

const fetchPlansApi = async (params = {}) => {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = queryString ? `/premium/plans?${queryString}` : "/premium/plans";

  const response = await httpService.get(url);
  const apiData = response.data;

  if (apiData?.data && Array.isArray(apiData.data)) {
    return { data: apiData.data, pagination: apiData.pagination || null };
  }
  if (Array.isArray(apiData)) {
    return { data: apiData, pagination: null };
  }
  return { data: [], pagination: null };
};

const fetchPlanByIdApi = async (id) => {
  const response = await httpService.get(`/premium/plans/${id}`);
  return response.data?.data || response.data;
};

const addPlanApi = async (data) => {
  const response = await httpService.post("/premium/plans", {}, data);
  return response.data?.data;
};

const updatePlanApi = async ({ id, ...data }) => {
  const response = await httpService.put(`/premium/plans/${id}`, {}, data);
  return response.data?.data;
};

const deletePlanApi = async (id) => {
  const response = await httpService.delete(`/premium/plans/${id}`);
  return response.data;
};

const grantPremiumApi = async (data) => {
  const response = await httpService.post("/premium/admin/grant", {}, data);
  return response.data;
};

const getUserPremiumHistoryApi = async (userId) => {
  const response = await httpService.get(`/premium/admin/history/${userId}`);
  return response.data?.data || [];
};

const cancelPremiumApi = async (userId) => {
  const response = await httpService.delete(`/premium/admin/cancel/${userId}`);
  return response.data;
};

// ── HOOKS ──────────────────────────────────────────────────

export const usePlans = (filters = {}) => {
  return useQuery({
    queryKey: ["premiumPlans", filters],
    queryFn: () => fetchPlansApi(filters),
    staleTime: 0,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const usePlan = (id) => {
  return useQuery({
    queryKey: ["premiumPlan", id],
    queryFn: () => fetchPlanByIdApi(id),
    enabled: !!id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

export const useAddPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addPlanApi,
    onSuccess: (newPlan) => {
      toast.success("Premium plan created successfully!");
      queryClient.setQueriesData(
        { queryKey: ["premiumPlans"], exact: false },
        (oldData) => {
          if (!oldData || !oldData.data) return oldData;
          return { ...oldData, data: [newPlan, ...oldData.data] };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["premiumPlans"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create plan");
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePlanApi,
    onSuccess: (updatedData, variables) => {
      toast.success("Premium plan updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["premiumPlans"] });
      queryClient.invalidateQueries({ queryKey: ["premiumPlan", variables.id] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update plan");
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePlanApi,
    onSuccess: () => {
      toast.success("Premium plan deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["premiumPlans"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete plan");
    },
  });
};

export const useGrantPremium = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: grantPremiumApi,
    onSuccess: () => {
      toast.success("Premium granted successfully!");
      queryClient.invalidateQueries({ queryKey: ["userPremiumHistory"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to grant premium");
    },
  });
};

export const useUserPremiumHistory = (userId) => {
  return useQuery({
    queryKey: ["userPremiumHistory", userId],
    queryFn: () => getUserPremiumHistoryApi(userId),
    enabled: !!userId,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useCancelPremium = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelPremiumApi,
    onSuccess: () => {
      toast.success("Premium cancelled successfully.");
      queryClient.invalidateQueries({ queryKey: ["userPremiumHistory"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to cancel premium");
    },
  });
};