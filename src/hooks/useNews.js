import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

const fetchNewsApi = async (params = {}) => {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = queryString ? `/news?${queryString}` : "/news";

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
const sendNewsNotificationApi = async (id) => {
  const response = await httpService.post(`/news/${id}/notify`);
  return response.data;
};
const deleteNewsApi = async (id) => {
  const response = await httpService.delete(`/news/${id}`);
  return response.data;
};

export const useNewsList = (filters) => {
  return useQuery({
    queryKey: ["newsList", filters],
    queryFn: () => fetchNewsApi(filters),
    staleTime: 0,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useNews = (id) => {
  return useQuery({
    queryKey: ["news", id],
    queryFn: () => fetchNewsByIdApi(id),
    enabled: !!id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

export const useAddNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addNewsApi,

    onSuccess: (newNews) => {
      toast.success("News added successfully!");

      queryClient.setQueriesData(
        { queryKey: ["newsList"], exact: false },
        (oldData) => {
          if (!oldData || !oldData.data) return oldData;

          return {
            ...oldData,
            data: [newNews, ...oldData.data],
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["newsList"] });

      queryClient.invalidateQueries({
        queryKey: ["dashboardStats"],
        refetchType: "none",
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add News");
    },
  });
};

export const useUpdateNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNewsApi,

    onSuccess: (updatedData) => {
      toast.success("News updated successfully!");

      queryClient.invalidateQueries({ queryKey: ["newsList"] });

      queryClient.invalidateQueries({
        queryKey: ["dashboardStats"],
        refetchType: "none",
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update News");
    },
  });
};

export const useDeleteNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNewsApi,

    onSuccess: () => {
      toast.success("News deleted successfully.");

      queryClient.invalidateQueries({ queryKey: ["newsList"] });

      queryClient.invalidateQueries({
        queryKey: ["dashboardStats"],
        refetchType: "none",
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete News");
    },
  });
};
export const useSendNewsNotification = () => {
  return useMutation({
    mutationFn: sendNewsNotificationApi,
    onSuccess: (data) => {
      toast.success(data.message || "Notification sent successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send notification");
    },
  });
};