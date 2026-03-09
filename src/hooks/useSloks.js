import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

const fetchSloksApi = async (params = {}) => {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = queryString ? `/slok?${queryString}` : "/slok";

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

const fetchSlokByIdApi = async (id) => {
  const response = await httpService.get(`/slok/${id}`);
  return response.data?.data || response.data;
};

const addSlokApi = async (data) => {
  // FIXED: Removed the empty {} so data is sent as the payload
  const response = await httpService.post("/slok/create", data);
  return response.data?.data;
};

const updateSlokApi = async ({ id, ...data }) => {
  // FIXED: Removed the empty {} so data is sent as the payload
  const response = await httpService.put(`/slok/${id}`, data);
  return response.data?.data;
};

const deleteSlokApi = async (id) => {
  const response = await httpService.delete(`/slok/${id}`);
  return response.data;
};

export const useSloks = (filters) => {
  return useQuery({
    queryKey: ["sloks", filters],
    queryFn: () => fetchSloksApi(filters),
    staleTime: 0,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useSlok = (id) => {
  return useQuery({
    queryKey: ["slok", id],
    queryFn: () => fetchSlokByIdApi(id),
    enabled: !!id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

export const useAddSlok = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addSlokApi,
    onSuccess: (newSlok) => {
      toast.success("Sloka added successfully!");

      queryClient.setQueriesData(
        { queryKey: ["sloks"], exact: false },
        (oldData) => {
          if (!oldData || !oldData.data) return oldData;
          return {
            ...oldData,
            data: [newSlok, ...oldData.data],
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["sloks"] });
      queryClient.invalidateQueries({
        queryKey: ["dashboardStats"],
        refetchType: "none",
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add Sloka");
    },
  });
};

export const useUpdateSlok = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSlokApi,
    onSuccess: () => {
      toast.success("Sloka updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["sloks"] });
      queryClient.invalidateQueries({
        queryKey: ["dashboardStats"],
        refetchType: "none",
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update Sloka");
    },
  });
};

export const useDeleteSlok = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSlokApi,
    onSuccess: () => {
      toast.success("Sloka deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["sloks"] });
      queryClient.invalidateQueries({
        queryKey: ["dashboardStats"],
        refetchType: "none",
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete Sloka");
    },
  });
};