import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

// --- API Functions ---

const fetchStutisApi = async (params = {}) => {
  const queryString = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined
      )
    )
  ).toString();

  const url = queryString ? `/stuti?${queryString}` : "/stuti";
  const response = await httpService.get(url);

  // Normalize Data Structure
  const apiData = response.data;

  // 1. Nested: { data: { data: [...], pagination: {...} } }
  if (apiData?.data?.data && Array.isArray(apiData.data.data)) {
    return apiData.data; 
  }
  
  // 2. Intermediate: { data: [...] }
  if (apiData?.data && Array.isArray(apiData.data)) {
    return { data: apiData.data, pagination: apiData.pagination || null };
  }

  // 3. Fallback: { [...] }
  if (Array.isArray(apiData)) {
    return { data: apiData, pagination: null };
  }

  return { data: [], pagination: null };
};

const fetchStutiByIdApi = async (id) => {
  const response = await httpService.get(`/stuti/${id}`);
  return response.data?.data || response.data;
};

const addStutiApi = async (data) => {
  const response = await httpService.post("/stuti/create", {}, data);
  return response.data?.data;
};

const updateStutiApi = async ({ id, ...data }) => {
  const response = await httpService.put(`/stuti/${id}`, {}, data);
  return response.data?.data;
};

const deleteStutiApi = async (id) => {
  const response = await httpService.delete(`/stuti/${id}`);
  return response.data;
};

// --- React Query Hooks ---

// 1. Fetch List (Read)
export const useStutis = (filters) => {
  return useQuery({
    queryKey: ["stutis", filters],
    queryFn: () => fetchStutisApi(filters),
    
    // ✅ Optimization: Fetch once, keep forever (until mutation/reset)
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};

// 2. Fetch Single (Read)
export const useStuti = (id) => {
  return useQuery({
    queryKey: ["stuti", id],
    queryFn: () => fetchStutiByIdApi(id),
    enabled: !!id,
    
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

// 3. Add Mutation (Write)
export const useAddStuti = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addStutiApi,
    onSuccess: () => {
      toast.success("Stuti added successfully!");
      queryClient.invalidateQueries(["stutis"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add Stuti");
    },
  });
};

// 4. Update Mutation (Write)
export const useUpdateStuti = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStutiApi,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["stutis"]);
      queryClient.invalidateQueries(["stuti", variables.id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update Stuti");
    },
  });
};

// 5. Delete Mutation (Write)
export const useDeleteStuti = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStutiApi,
    onSuccess: () => {
      toast.success("Stuti deleted successfully.");
      queryClient.invalidateQueries(["stutis"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete Stuti");
    },
  });
};