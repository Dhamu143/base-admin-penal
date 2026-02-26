import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

const fetchFestivalsApi = async (params = {}) => {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = queryString ? `/festival?${queryString}` : "/festival";

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

const fetchFestivalByIdApi = async (id) => {
  const response = await httpService.get(`/festival/${id}`);
  return response.data?.data || response.data;
};

const addFestivalApi = async (data) => {
  const response = await httpService.post("/festival/create", {}, data);
  return response.data?.data;
};

const updateFestivalApi = async ({ id, ...data }) => {
  const response = await httpService.put(`/festival/${id}`, {}, data);
  return response.data?.data;
};

const deleteFestivalApi = async (id) => {
  const response = await httpService.delete(`/festival/${id}`);
  return response.data;
};

export const useFestivals = (filters) => {
  return useQuery({
    queryKey: ["festivals", filters],
    queryFn: () => fetchFestivalsApi(filters),
    staleTime: 0,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useFestival = (id) => {
  return useQuery({
    queryKey: ["festival", id],
    queryFn: () => fetchFestivalByIdApi(id),
    enabled: !!id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

export const useAddFestival = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addFestivalApi,
    onSuccess: (newFestival) => {
      toast.success("Festival added successfully!");

      queryClient.setQueriesData(
        { queryKey: ["festivals"], exact: false },
        (oldData) => {
          if (!oldData || !oldData.data) return oldData;

          return {
            ...oldData,
            data: [newFestival, ...oldData.data],
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["festivals"] });
      queryClient.invalidateQueries({
        queryKey: ["dashboardStats"],
        refetchType: "none",
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add festival");
    },
  });
};

export const useUpdateFestival = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFestivalApi,
    onSuccess: () => {
      toast.success("Festival updated successfully!");

      queryClient.invalidateQueries({ queryKey: ["festivals"] });
      queryClient.invalidateQueries({
        queryKey: ["dashboardStats"],
        refetchType: "none",
      });
    },
    onError: () => {
      toast.error("Failed to update festival");
    },
  });
};

export const useDeleteFestival = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFestivalApi,
    onSuccess: () => {
      toast.success("Festival deleted successfully!");

      queryClient.invalidateQueries({ queryKey: ["festivals"] });
      queryClient.invalidateQueries({
        queryKey: ["dashboardStats"],
        refetchType: "none",
      });
    },
    onError: () => {
      toast.error("Failed to delete festival");
    },
  });
};