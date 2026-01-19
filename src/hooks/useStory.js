import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

// --- API Functions ---

const fetchStoriesApi = async (params = {}) => {
  const queryString = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined
      )
    )
  ).toString();

  const url = queryString ? `/story?${queryString}` : "/story";
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

const fetchStoryByIdApi = async (id) => {
  const response = await httpService.get(`/story/${id}`);
  return response.data?.data || response.data;
};

const addStoryApi = async (data) => {
  const response = await httpService.post("/story/create", {}, data);
  return response.data?.data;
};

const updateStoryApi = async ({ id, ...data }) => {
  const response = await httpService.put(`/story/${id}`, {}, data);
  return response.data?.data;
};

const deleteStoryApi = async (id) => {
  const response = await httpService.delete(`/story/${id}`);
  return response.data;
};

// --- React Query Hooks ---

// 1. Fetch List (Read)
export const useStories = (filters) => {
  return useQuery({
    queryKey: ["stories", filters],
    queryFn: () => fetchStoriesApi(filters),
    
    // ✅ Optimization: Fetch once, keep forever (until mutation/reset)
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};

// 2. Fetch Single (Read)
export const useStory = (id) => {
  return useQuery({
    queryKey: ["story", id],
    queryFn: () => fetchStoryByIdApi(id),
    enabled: !!id,
    
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

// 3. Add Mutation (Write)
export const useAddStory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addStoryApi,
    onSuccess: () => {
      toast.success("Story added successfully!");
      queryClient.invalidateQueries(["stories"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add Story");
    },
  });
};

// 4. Update Mutation (Write)
export const useUpdateStory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStoryApi,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["stories"]);
      queryClient.invalidateQueries(["story", variables.id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update Story");
    },
  });
};

// 5. Delete Mutation (Write)
export const useDeleteStory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStoryApi,
    onSuccess: () => {
      toast.success("Story deleted successfully.");
      queryClient.invalidateQueries(["stories"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete Story");
    },
  });
};