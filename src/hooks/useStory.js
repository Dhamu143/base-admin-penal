import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";


const fetchStoriesApi = async (params = {}) => {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = queryString ? `/story?${queryString}` : "/story";
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
export const useStories = (filters) => {
  return useQuery({
    queryKey: ["stories", filters],
    queryFn: () => fetchStoriesApi(filters),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useStory = (id) => {
  return useQuery({
    queryKey: ["story", id],
    queryFn: () => fetchStoryByIdApi(id),
    enabled: !!id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

export const useAddStory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addStoryApi,
    onSuccess: () => {
      toast.success("Story added successfully!");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"], refetchType: "none" });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add Story");
    },
  });
};

export const useUpdateStory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStoryApi,
    onSuccess: (updatedData, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.setQueryData(["story", variables.id], updatedData);
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"], refetchType: "none" });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update Story");
    },
  });
};

export const useDeleteStory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStoryApi,
    onSuccess: () => {
      toast.success("Story deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"], refetchType: "none" });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete Story");
    },
  });
};