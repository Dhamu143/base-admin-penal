import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

const fetchWallpapersApi = async (params = {}) => {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = queryString ? `/wallpaper?${queryString}` : "/wallpaper";

  const response = await httpService.get(url);
  const apiData = response.data;

  if (apiData?.data?.data && Array.isArray(apiData.data.data)) {
    return apiData.data;
  }
  return { data: [], pagination: null };
};

const fetchWallpaperByIdApi = async (id) => {
  const response = await httpService.get(`/wallpaper/${id}`);
  return response.data?.data || response.data;
};

const addWallpaperApi = async (data) => {
  const response = await httpService.post("/wallpaper/create", {}, data);
  return response.data?.data;
};

const updateWallpaperApi = async ({ id, ...data }) => {
  const response = await httpService.put(`/wallpaper/${id}`, {}, data);
  return response.data?.data;
};

const deleteWallpaperApi = async (id) => {
  const response = await httpService.delete(`/wallpaper/${id}`);
  return response.data;
};

export const useWallpapers = (filters) => {
  return useQuery({
    queryKey: ["wallpapers", filters],
    queryFn: () => fetchWallpapersApi(filters),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useWallpaper = (id) => {
  return useQuery({
    queryKey: ["wallpaper", id],
    queryFn: () => fetchWallpaperByIdApi(id),
    enabled: !!id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

export const useAddWallpaper = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addWallpaperApi,
    onSuccess: () => {
      toast.success("Wallpaper added successfully!");
      queryClient.invalidateQueries({ queryKey: ["wallpapers"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add Wallpaper");
    },
  });
};

export const useUpdateWallpaper = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateWallpaperApi,
    onSuccess: (updatedData, variables) => {
      queryClient.invalidateQueries({ queryKey: ["wallpapers"] });
      queryClient.setQueryData(["wallpaper", variables.id], updatedData);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update Wallpaper");
    },
  });
};

export const useDeleteWallpaper = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWallpaperApi,
    onSuccess: () => {
      toast.success("Wallpaper deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["wallpapers"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete Wallpaper");
    },
  });
};