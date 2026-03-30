import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

const fetchChatsApi = async (params = {}) => {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = queryString ? `/chat?${queryString}` : "/chat";

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

const fetchChatByIdApi = async (id) => {
  const response = await httpService.get(`/chat/${id}`);
  return response.data?.data || response.data;
};

const addChatApi = async (data) => {
  const response = await httpService.post("/chat", {}, data);
  return response.data?.data || response.data;
};

const updateChatApi = async ({ id, ...data }) => {
  const response = await httpService.put(`/chat/${id}`, {}, data);
  return response.data?.data || response.data;
};

const deleteChatApi = async (id) => {
  const response = await httpService.delete(`/chat/${id}`);
  return response.data;
};

export const useChats = (filters) => {
  return useQuery({
    queryKey: ["chats", filters],
    queryFn: () => fetchChatsApi(filters),
    staleTime: 0,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useChat = (id) => {
  return useQuery({
    queryKey: ["chat", id],
    queryFn: () => fetchChatByIdApi(id),
    enabled: !!id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

export const useAddChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addChatApi,
    onSuccess: () => {
      toast.success("Chat added successfully!");
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add Chat");
    },
  });
};

export const useUpdateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateChatApi,
    onSuccess: (updatedData, variables) => {
      toast.success("Chat updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chat", variables.id] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update Chat");
    },
  });
};

export const useDeleteChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteChatApi,
    onSuccess: () => {
      toast.success("Chat deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete Chat");
    },
  });
};