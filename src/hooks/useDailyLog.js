import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import http from "../common/http.service";
import { toast } from "react-toastify";

const BASE_PATH = "/dailylog";

// --- API Functions ---

const fetchDailyLogsApi = async (params = {}) => {
    console.log("🔍 [API] Fetching Daily Logs with params:", params);
    const response = await http.get(`${BASE_PATH}/all`, params);

    // Normalize Data Structure
    let rawData = response.data?.data || response.data || [];
    let list = rawData.data || rawData;

    // Ensure list is an array
    if (!Array.isArray(list) && typeof list === "object") {
        list = [list];
    }

    // Return standardized object
    return {
        data: list,
        pagination: rawData.pagination || null,
    };
};

const fetchDailyLogByIdApi = async (id) => {
    const response = await http.get(`${BASE_PATH}/${id}`);
    return response.data?.data || response.data;
};

const addDailyLogApi = async (data) => {
    // Signature: post(url, params, payload) -> we pass {} for params
    const response = await http.post(`${BASE_PATH}/add`, {}, data);
    return response.data?.data || response.data;
};

const updateDailyLogApi = async ({ id, ...data }) => {
    const response = await http.put(`${BASE_PATH}/edit/${id}`, {}, data);
    return response.data?.data || response.data;
};

const deleteDailyLogApi = async (id) => {
    const response = await http.delete(`${BASE_PATH}/delete/${id}`);
    return response.data;
};

// --- React Query Hooks ---

// 1. Fetch List (Read)
export const useDailyLogs = (filters) => {
    return useQuery({
        queryKey: ["dailyLogs", filters],
        queryFn: () => fetchDailyLogsApi(filters),

        // ✅ "Fetch Once, Keep Forever" Optimization
        staleTime: Infinity,
        refetchOnWindowFocus: false,

        keepPreviousData: true,
    });
};

// 2. Fetch Single Log (Read)
export const useDailyLog = (id) => {
    return useQuery({
        queryKey: ["dailyLog", id],
        queryFn: () => fetchDailyLogByIdApi(id),
        enabled: !!id,

        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });
};

// 3. Add Mutation (Write)
export const useAddDailyLog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addDailyLogApi,
        onSuccess: () => {
            toast.success("Daily Log added successfully!");
            // 🚀 Force refresh list
            queryClient.invalidateQueries(["dailyLogs"]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to add log");
        },
    });
};

// 4. Update Mutation (Write)
export const useUpdateDailyLog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateDailyLogApi,
        onSuccess: (data, variables) => {
            // 🚀 Refresh list AND specific detail
            queryClient.invalidateQueries(["dailyLogs"]);
            queryClient.invalidateQueries(["dailyLog", variables.id]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update log");
        },
    });
};

// 5. Delete Mutation (Write)
export const useDeleteDailyLog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteDailyLogApi,
        onSuccess: () => {
            toast.success("Daily Log deleted successfully.");
            queryClient.invalidateQueries(["dailyLogs"]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete log");
        },
    });
};