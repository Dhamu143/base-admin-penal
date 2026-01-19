import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

// --- API Functions ---

const fetchBhajansApi = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, v]) => v !== "" && v !== null && v !== undefined
    )
  );

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = queryString ? `/bhajan?${queryString}` : "/bhajan";
  const response = await httpService.get(url);

  const apiData = response.data; // Layer 1

  // ✅ FIX: Check deeper nesting first (response.data.data.data)
  // This is the common structure for paginated responses
  if (apiData?.data?.data && Array.isArray(apiData.data.data)) {
    return apiData.data; // Returns object { data: [...], pagination: {...} }
  }

  // Check shallow nesting (response.data.data is the array)
  if (apiData?.data && Array.isArray(apiData.data)) {
    return { data: apiData.data, pagination: apiData.pagination || null };
  }

  // Fallback: If response.data itself is the array
  if (Array.isArray(apiData)) {
    return { data: apiData, pagination: null };
  }

  return { data: [], pagination: null };
};

const fetchBhajanByIdApi = async (id) => {
  const response = await httpService.get(`/bhajan/${id}`);
  return response.data?.data || response.data;
};

const addBhajanApi = async (data) => {
  const response = await httpService.post("/bhajan/create", {}, data);
  return response.data?.data;
};

const updateBhajanApi = async ({ id, ...data }) => {
  const response = await httpService.put(`/bhajan/${id}`, {}, data);
  return response.data?.data;
};

const deleteBhajanApi = async (id) => {
  const response = await httpService.delete(`/bhajan/${id}`);
  return response.data;
};

// --- React Query Hooks ---

export const useBhajans = (filters) => {
  return useQuery({
    queryKey: ["bhajans", filters],
    queryFn: () => fetchBhajansApi(filters),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};

export const useBhajan = (id) => {
  return useQuery({
    queryKey: ["bhajan", id],
    queryFn: () => fetchBhajanByIdApi(id),
    enabled: !!id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

export const useAddBhajan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addBhajanApi,
    onSuccess: () => {
      toast.success("Bhajan added successfully!");
      queryClient.invalidateQueries(["bhajans"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add Bhajan");
    },
  });
};

export const useUpdateBhajan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBhajanApi,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["bhajans"]);
      queryClient.invalidateQueries(["bhajan", variables.id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update Bhajan");
    },
  });
};

export const useDeleteBhajan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBhajanApi,
    onSuccess: () => {
      toast.success("Bhajan deleted successfully.");
      queryClient.invalidateQueries(["bhajans"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete Bhajan");
    },
  });
};