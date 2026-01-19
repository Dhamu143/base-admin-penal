import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

// --- API Functions (Same as before) ---
const fetchGodsApi = async ({ page, limit }) => {
    const response = await httpService.get("/godmaster", { page, limit });
    return response.data;
};

const addGodApi = async (godData) => {
    const response = await httpService.post("/godmaster/create", {}, godData);
    return response.data?.data;
};

const updateGodApi = async ({ id, ...data }) => {
    const response = await httpService.put(`/godmaster/${id}`, {}, data);
    return response.data?.data;
};

const deleteGodApi = async (id) => {
    await httpService.delete(`/godmaster/${id}`);
    return id;
};

// --- React Query Hooks ---

// 1. Fetch List (The Read Operation)
export const useGods = (page = 1, limit = 10) => {
    return useQuery({
        queryKey: ["gods", page, limit],
        queryFn: () => fetchGodsApi({ page, limit }),

        // ✅ THIS IS THE MAGIC SETTING
        staleTime: Infinity,
        // Meaning: Data is "fresh" forever. 
        // If you leave the page and come back, it uses the cache. No API call.

        keepPreviousData: true,
        refetchOnWindowFocus: false, // Don't refetch when clicking back on the window
    });
};

// 2. Mutations (The Write Operations)
// These will force the API call to happen because we use 'invalidateQueries'

export const useAddGod = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addGodApi,
        onSuccess: () => {
            toast.success("God added successfully!");
            // ✅ This forces a refetch ONLY after you successfully add a new God
            queryClient.invalidateQueries(["gods"]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to add god.");
        },
    });
};

export const useUpdateGod = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateGodApi,
        onSuccess: (data, variables) => {
            // ✅ This forces a refetch ONLY after you successfully toggle/update
            queryClient.invalidateQueries(["gods"]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update god.");
        },
    });
};

export const useDeleteGod = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteGodApi,
        onSuccess: () => {
            // ✅ This forces a refetch ONLY after you successfully delete
            queryClient.invalidateQueries(["gods"]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete god.");
        },
    });
};