import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

const fetchStutisApi = async (params = {}) => {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = queryString ? `/stuti?${queryString}` : "/stuti";

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

export const useStutis = (filters) => {
  return useQuery({
    queryKey: ["stutis", filters],
    queryFn: () => fetchStutisApi(filters),
    staleTime: 0,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useStuti = (id) => {
  return useQuery({
    queryKey: ["stuti", id],
    queryFn: () => fetchStutiByIdApi(id),
    enabled: !!id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

export const useAddStuti = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addStutiApi,

    onSuccess: (newStuti) => {
      toast.success("Stuti added successfully!");

      queryClient.setQueriesData(
        { queryKey: ["stutis"], exact: false },
        (oldData) => {
          if (!oldData || !oldData.data) return oldData;

          return {
            ...oldData,
            data: [newStuti, ...oldData.data],
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["stutis"] });

      queryClient.invalidateQueries({
        queryKey: ["dashboardStats"],
        refetchType: "none",
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add Stuti");
    },
  });
};

export const useUpdateStuti = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStutiApi,

    onSuccess: () => {
      toast.success("Stuti updated successfully!");

      queryClient.invalidateQueries({ queryKey: ["stutis"] });

      queryClient.invalidateQueries({
        queryKey: ["dashboardStats"],
        refetchType: "none",
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update Stuti");
    },
  });
};

export const useDeleteStuti = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStutiApi,

    onSuccess: () => {
      toast.success("Stuti deleted successfully.");

      queryClient.invalidateQueries({ queryKey: ["stutis"] });

      queryClient.invalidateQueries({
        queryKey: ["dashboardStats"],
        refetchType: "none",
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete Stuti");
    },
  });
};
