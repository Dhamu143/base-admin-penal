import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

const fetchBhajansApi = async (params = {}) => {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = queryString ? `/bhajan?${queryString}` : "/bhajan";

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

const fetchBhajanByIdApi = async (id) => {
  const response = await httpService.get(`/bhajan/${id}`);
  return response.data?.data || response.data;
};

const addBhajanApi = async (data) => {
  const response = await httpService.post("/bhajan/create", {}, data);
  return response.data?.data;
};

const updateBhajanApi = async ({ id, ...data }) => {
  const response = await httpService.put(`/bhajan/${id}`, {}, data);
  return response.data?.data;
};

const deleteBhajanApi = async (id) => {
  const response = await httpService.delete(`/bhajan/${id}`);
  return response.data;
};

const sendBhajanNotificationApi = async (id) => {
  const response = await httpService.post(`/bhajan/${id}/notify`);
  return response.data;
};

export const useBhajans = (filters) => {
  return useQuery({
    queryKey: ["bhajans", filters],
    queryFn: () => fetchBhajansApi(filters),
    staleTime: 0,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useBhajan = (id) => {
  return useQuery({
    queryKey: ["bhajan", id],
    queryFn: () => fetchBhajanByIdApi(id),
    enabled: !!id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

export const useAddBhajan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBhajanApi,

    onSuccess: (newBhajan) => {
      toast.success("Bhajan added successfully!");

      queryClient.setQueriesData(
        { queryKey: ["bhajans"], exact: false },
        (oldData) => {
          if (!oldData || !oldData.data) return oldData;

          return {
            ...oldData,
            data: [newBhajan, ...oldData.data],
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["bhajans"] });

      queryClient.invalidateQueries({
        queryKey: ["dashboardStats"],
        refetchType: "none",
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add Bhajan");
    },
  });
};

export const useUpdateBhajan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBhajanApi,

    onSuccess: () => {
      toast.success("Bhajan updated successfully!");

      queryClient.invalidateQueries({ queryKey: ["bhajans"] });

      queryClient.invalidateQueries({
        queryKey: ["dashboardStats"],
        refetchType: "none",
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update Bhajan");
    },
  });
};

export const useDeleteBhajan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBhajanApi,

    onSuccess: () => {
      toast.success("Bhajan deleted successfully.");

      queryClient.invalidateQueries({ queryKey: ["bhajans"] });

      queryClient.invalidateQueries({
        queryKey: ["dashboardStats"],
        refetchType: "none",
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete Bhajan");
    },
  });
};

export const useSendBhajanNotification = () => {
  return useMutation({
    mutationFn: sendBhajanNotificationApi,
    onSuccess: (data) => {
      toast.success(data.message || "Notification sent successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send notification");
    },
  });
};