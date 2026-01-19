import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

// --- API Functions ---

const fetchSloksApi = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, v]) => v !== "" && v !== null && v !== undefined
    )
  );

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = queryString ? `/slok?${queryString}` : "/slok";
  const response = await httpService.get(url);

  // Normalize Data Structure
  const apiData = response.data;

  // 1. Nested structure: { data: { data: [...], pagination: {...} } }
  if (apiData?.data?.data && Array.isArray(apiData.data.data)) {
    return apiData.data; 
  }
  
  // 2. Intermediate structure: { data: [...] } (Pagination might be sibling)
  if (apiData?.data && Array.isArray(apiData.data)) {
    return { data: apiData.data, pagination: apiData.pagination || null };
  }

  // 3. Fallback: { [...] }
  if (Array.isArray(apiData)) {
    return { data: apiData, pagination: null };
  }

  return { data: [], pagination: null };
};

const fetchSlokByIdApi = async (id) => {
  const response = await httpService.get(`/slok/${id}`);
  return response.data?.data || response.data;
};

const addSlokApi = async (data) => {
  const response = await httpService.post("/slok/create", {}, data);
  return response.data?.data;
};

const updateSlokApi = async ({ id, ...data }) => {
  const response = await httpService.put(`/slok/${id}`, {}, data);
  return response.data?.data;
};

const deleteSlokApi = async (id) => {
  const response = await httpService.delete(`/slok/${id}`);
  return response.data;
};

// --- React Query Hooks ---

// 1. Fetch List (Read)
export const useSloks = (filters) => {
  return useQuery({
    queryKey: ["sloks", filters],
    queryFn: () => fetchSloksApi(filters),
    
    // ✅ Optimization: Fetch once, keep forever (until mutation/reset)
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};

// 2. Fetch Single (Read)
export const useSlok = (id) => {
  return useQuery({
    queryKey: ["slok", id],
    queryFn: () => fetchSlokByIdApi(id),
    enabled: !!id,
    
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

// 3. Add Mutation (Write)
export const useAddSlok = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addSlokApi,
    onSuccess: () => {
      toast.success("Sloka added successfully!");
      queryClient.invalidateQueries(["sloks"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add Sloka");
    },
  });
};

// 4. Update Mutation (Write)
export const useUpdateSlok = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSlokApi,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["sloks"]);
      queryClient.invalidateQueries(["slok", variables.id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update Sloka");
    },
  });
};

// 5. Delete Mutation (Write)
export const useDeleteSlok = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSlokApi,
    onSuccess: () => {
      toast.success("Sloka deleted successfully.");
      queryClient.invalidateQueries(["sloks"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete Sloka");
    },
  });
};