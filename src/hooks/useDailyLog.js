import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import http from "../common/http.service";

const BASE_PATH = "/dailylog";

const fetchDailyLogsAPI = async ({ page, limit }) => {
    const params = { page, limit };
    const response = await http.get(`${BASE_PATH}/all`, params);
    return response.data?.data || response.data;
};

const fetchDailyLogByIdAPI = async (id) => {
    if (!id) return null;
    const response = await http.get(`${BASE_PATH}/${id}`);
    return response.data?.data || response.data;
};

const createDailyLogAPI = async (data) => {
    const response = await http.post(`${BASE_PATH}/add`, null, data);
    return response.data?.data || response.data;
};

const updateDailyLogAPI = async ({ id, ...data }) => {
    const response = await http.put(`${BASE_PATH}/edit/${id}`, null, data);
    return response.data?.data || response.data;
};

const deleteDailyLogAPI = async (id) => {
    await http.delete(`${BASE_PATH}/delete/${id}`);
    return id;
};

export const useDailyLogs = (params) => {
    return useQuery({
        queryKey: ["dailyLogs", params],
        queryFn: () => fetchDailyLogsAPI(params),
        keepPreviousData: true,
        staleTime: Infinity,        
        refetchOnWindowFocus: false,
        refetchOnMount: false,    
        retry: 1,  
    });
};

export const useDailyLog = (id) => {
    return useQuery({
        queryKey: ["dailyLog", id],
        queryFn: () => fetchDailyLogByIdAPI(id),
        enabled: !!id,
        staleTime: Infinity, 
        retry: false,
        refetchOnWindowFocus: false,
    });
};


export const useCreateDailyLog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createDailyLogAPI,
        onSuccess: () => {
            queryClient.invalidateQueries(["dailyLogs"]);
        },
    });
};

export const useUpdateDailyLog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateDailyLogAPI,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["dailyLogs"]);
            queryClient.invalidateQueries(["dailyLog", variables.id]);
            queryClient.invalidateQueries(["dashboardStats"]);

        },
    });
};

export const useDeleteDailyLog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteDailyLogAPI,
        onSuccess: () => {
            queryClient.invalidateQueries(["dailyLogs"]);
            queryClient.invalidateQueries(["dashboardStats"]);

        },
    });
};