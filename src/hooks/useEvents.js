import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../common/http.service"; 

// Fetch all events with pagination & filters
export const useEvents = (filters) => {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: async () => {
      // FIX: Pass 'filters' directly as the second argument
      const { data } = await apiClient.get("/events", filters);
      return data;
    },
    keepPreviousData: true,
  });
};

// Fetch single event
export const useEvent = (id) => {
  return useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      // FIX: No params needed here, so pass an empty object
      const { data } = await apiClient.get(`/events/${id}`, {});
      return data.data;
    },
    enabled: !!id,
  });
};

// Create event
export const useAddEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      // FIX: Pass empty object {} for params, and payload as the 3rd argument
      const { data } = await apiClient.post("/events/create", {}, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
    },
  });
};

// Update event
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      // FIX: Pass empty object {} for params, and payload as the 3rd argument
      const { data } = await apiClient.put(`/events/${id}`, {}, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
      queryClient.invalidateQueries(["event"]);
    },
  });
};

// Delete event
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      // FIX: Ensure delete follows your HttpService signature
      const { data } = await apiClient.delete(`/events/${id}`, {});
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
    },
  });
};