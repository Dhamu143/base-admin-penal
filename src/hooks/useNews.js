import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

// --- API Functions ---

const fetchNewsApi = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, v]) => v !== "" && v !== null && v !== undefined
    )
  );

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = queryString ? `/news?${queryString}` : "/news";
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

const fetchNewsByIdApi = async (id) => {
  const response = await httpService.get(`/news/${id}`);
  return response.data?.data || response.data;
};

const addNewsApi = async (data) => {
  const response = await httpService.post("/news/create", {}, data);
  return response.data?.data;
};

const updateNewsApi = async ({ id, ...data }) => {
  const response = await httpService.put(`/news/${id}`, {}, data);
  return response.data?.data;
};

const deleteNewsApi = async (id) => {
  const response = await httpService.delete(`/news/${id}`);
  return response.data;
};

// --- React Query Hooks ---

// 1. Fetch List (Read)
export const useNewsList = (filters) => {
  return useQuery({
    queryKey: ["newsList", filters],
    queryFn: () => fetchNewsApi(filters),
    
    // ✅ Optimization: Fetch once, keep forever (until mutation/reset)
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};

// 2. Fetch Single (Read)
export const useNews = (id) => {
  return useQuery({
    queryKey: ["news", id],
    queryFn: () => fetchNewsByIdApi(id),
    enabled: !!id,
    
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

// 3. Add Mutation (Write)
export const useAddNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addNewsApi,
    onSuccess: () => {
      toast.success("News added successfully!");
      queryClient.invalidateQueries(["newsList"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add News");
    },
  });
};

// 4. Update Mutation (Write)
export const useUpdateNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNewsApi,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["newsList"]);
      queryClient.invalidateQueries(["news", variables.id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update News");
    },
  });
};

// 5. Delete Mutation (Write)
export const useDeleteNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNewsApi,
    onSuccess: () => {
      toast.success("News deleted successfully.");
      queryClient.invalidateQueries(["newsList"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete News");
    },
  });
};