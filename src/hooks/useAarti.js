import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

const fetchAartisApi = async (params = {}) => {
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});

    const queryString = new URLSearchParams(cleanParams).toString();

    const url = queryString ? `/aarti?${queryString}` : "/aarti";


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

const fetchAartiByIdApi = async (id) => {
    const response = await httpService.get(`/aarti/${id}`);
    return response.data?.data || response.data;
};

const addAartiApi = async (data) => {
    const response = await httpService.post("/aarti/create", {}, data);
    return response.data?.data;
};

const updateAartiApi = async ({ id, ...data }) => {
    const response = await httpService.put(`/aarti/${id}`, {}, data);
    return response.data?.data;
};

const deleteAartiApi = async (id) => {
    const response = await httpService.delete(`/aarti/${id}`);
    return response.data;
};

// FIXED: Changed endpoint to /aarti and updated function name
const sendAartiNotificationApi = async (id) => {
    const response = await httpService.post(`/aarti/${id}/notify`);
    return response.data;
};

export const useAartis = (filters) => {
    return useQuery({
        queryKey: ["aartis", filters],
        queryFn: () => fetchAartisApi(filters),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    });
};

export const useAarti = (id) => {
    return useQuery({
        queryKey: ["aarti", id],
        queryFn: () => fetchAartiByIdApi(id),
        enabled: !!id,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });
};

export const useAddAarti = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addAartiApi,
        onSuccess: () => {
            toast.success("Aarti added successfully!");
            queryClient.invalidateQueries({ queryKey: ["aartis"] });
            queryClient.invalidateQueries({
                queryKey: ["dashboardStats"],
                refetchType: "none"
            });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to add Aarti");
        },
    });
};

export const useUpdateAarti = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateAartiApi,
        onSuccess: (updatedData, variables) => {
            queryClient.invalidateQueries({ queryKey: ["aartis"] });

            queryClient.setQueryData(["aarti", variables.id], updatedData);

            queryClient.invalidateQueries({
                queryKey: ["dashboardStats"],
                refetchType: "none"
            });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update Aarti");
        },
    });
};

export const useDeleteAarti = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteAartiApi,
        onSuccess: () => {
            toast.success("Aarti deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ["aartis"] });
            queryClient.invalidateQueries({
                queryKey: ["dashboardStats"],
                refetchType: "none"
            });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete Aarti");
        },
    });
};

// FIXED: Renamed hook and linked correct API function
export const useSendAartiNotification = () => {
    return useMutation({
        mutationFn: sendAartiNotificationApi,
        onSuccess: (data) => {
            toast.success(data.message || "Notification sent successfully!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to send notification");
        },
    });
};