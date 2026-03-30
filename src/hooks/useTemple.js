import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";


const fetchTemplesApi = async (params = {}) => {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = queryString ? `/temple?${queryString}` : "/temple";

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

const fetchTempleByIdApi = async (id) => {
  const response = await httpService.get(`/temple/${id}`);
  return response.data?.data || response.data;
};

const addTempleApi = async (data) => {
  const response = await httpService.post("/temple/create", {}, data);
  return response.data?.data;
};

const updateTempleApi = async ({ id, ...data }) => {
  const response = await httpService.put(`/temple/${id}`, {}, data);
  return response.data?.data;
};

const deleteTempleApi = async (id) => {
  const response = await httpService.delete(`/temple/${id}`);
  return response.data;
};


export const useTemples = (filters) => {
  return useQuery({
    queryKey: ["temples", filters],
    queryFn: () => fetchTemplesApi(filters),

    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useTemple = (id) => {
  return useQuery({
    queryKey: ["temple", id],
    queryFn: () => fetchTempleByIdApi(id),
    enabled: !!id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};
export const useAddTemple = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTempleApi,
    onSuccess: () => {
      toast.success("Temple added successfully!");
      queryClient.invalidateQueries({ queryKey: ["temples"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"], refetchType: "none" });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add Temple");
    },
  });
};

export const useUpdateTemple = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTempleApi,
    onSuccess: (updatedData, variables) => {
      queryClient.invalidateQueries({ queryKey: ["temples"] });
      queryClient.setQueryData(["temple", variables.id], updatedData);
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"], refetchType: "none" });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update Temple");
    },
  });
};

export const useDeleteTemple = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTempleApi,
    onSuccess: () => {
      toast.success("Temple deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["temples"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"], refetchType: "none" });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete Temple");
    },
  });
};
const sendTempleNotificationApi = async (id) => {
  // Adjust this route if your backend route is different (e.g., /temple/notify/${id})
  const response = await httpService.post(`/temple/${id}/notify`);
  return response.data;
};

// Add this exported hook at the bottom of the file
export const useSendTempleNotification = () => {
  return useMutation({
    mutationFn: sendTempleNotificationApi,
    onSuccess: () => {
      toast.success("Notification sent successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send notification");
    },
  });
};