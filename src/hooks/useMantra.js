import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

// --- API Functions ---

const fetchMantrasApi = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, v]) => v !== "" && v !== null && v !== undefined
    )
  );

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = queryString ? `/mantra?${queryString}` : "/mantra";
  const response = await httpService.get(url);

  // Normalize Data Structure
  const apiData = response.data;
  
  // 1. Check for nested structure: { data: { data: [...], pagination: {...} } }
  if (apiData?.data?.data && Array.isArray(apiData.data.data)) {
    return apiData.data; 
  }
  
  // 2. Check for intermediate structure: { data: [...] }
  if (apiData?.data && Array.isArray(apiData.data)) {
    return { data: apiData.data, pagination: apiData.pagination || null };
  }

  // 3. Fallback: { [...] }
  if (Array.isArray(apiData)) {
    return { data: apiData, pagination: null };
  }

  return { data: [], pagination: null };
};

const fetchMantraByIdApi = async (id) => {
  const response = await httpService.get(`/mantra/${id}`);
  return response.data?.data || response.data;
};

const addMantraApi = async (data) => {
  const response = await httpService.post("/mantra/create", {}, data);
  return response.data?.data;
};

const updateMantraApi = async ({ id, ...data }) => {
  const response = await httpService.put(`/mantra/${id}`, {}, data);
  return response.data?.data;
};

const deleteMantraApi = async (id) => {
  const response = await httpService.delete(`/mantra/${id}`);
  return response.data;
};

// --- React Query Hooks ---

// 1. Fetch List (Read)
export const useMantras = (filters) => {
  return useQuery({
    queryKey: ["mantras", filters],
    queryFn: () => fetchMantrasApi(filters),
    
    // ✅ Optimization: Fetch once, keep forever (until mutation/reset)
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};

// 2. Fetch Single (Read)
export const useMantra = (id) => {
  return useQuery({
    queryKey: ["mantra", id],
    queryFn: () => fetchMantraByIdApi(id),
    enabled: !!id,
    
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

// 3. Add Mutation (Write)
export const useAddMantra = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addMantraApi,
    onSuccess: () => {
      toast.success("Mantra added successfully!");
      queryClient.invalidateQueries(["mantras"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add Mantra");
    },
  });
};

// 4. Update Mutation (Write)
export const useUpdateMantra = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMantraApi,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["mantras"]);
      queryClient.invalidateQueries(["mantra", variables.id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update Mantra");
    },
  });
};

// 5. Delete Mutation (Write)
export const useDeleteMantra = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMantraApi,
    onSuccess: () => {
      toast.success("Mantra deleted successfully.");
      queryClient.invalidateQueries(["mantras"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete Mantra");
    },
  });
};