import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

// Adjust these endpoints if your backend route prefix is different (e.g., /api/badge)
const fetchBadgesApi = async (params = {}) => {
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});

    const queryString = new URLSearchParams(cleanParams).toString();
    const url = queryString ? `/badge?${queryString}` : "/badge";

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

const fetchBadgeByIdApi = async (id) => {
    const response = await httpService.get(`/badge/${id}`);
    return response.data?.data || response.data;
};

const addBadgeApi = async (data) => {
    const response = await httpService.post("/badge/create", {}, data);
    return response.data?.data;
};

const updateBadgeApi = async ({ id, ...data }) => {
    const response = await httpService.put(`/badge/${id}`, {}, data);
    return response.data?.data;
};

const deleteBadgeApi = async (id) => {
    const response = await httpService.delete(`/badge/${id}`);
    return response.data;
};

export const useBadges = (filters) => {
    return useQuery({
        queryKey: ["badges", filters],
        queryFn: () => fetchBadgesApi(filters),
        staleTime: 0,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    });
};

export const useBadge = (id) => {
    return useQuery({
        queryKey: ["badge", id],
        queryFn: () => fetchBadgeByIdApi(id),
        enabled: !!id,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });
};

export const useAddBadge = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addBadgeApi,
        onSuccess: (newBadge) => {
            toast.success("Badge added successfully!");
            queryClient.setQueriesData(
                { queryKey: ["badges"], exact: false },
                (oldData) => {
                    if (!oldData || !oldData.data) return oldData;
                    return {
                        ...oldData,
                        data: [newBadge, ...oldData.data],
                    };
                }
            );
            queryClient.invalidateQueries({ queryKey: ["badges"] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to add Badge");
        },
    });
};

export const useUpdateBadge = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateBadgeApi,
        onSuccess: () => {
            toast.success("Badge updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["badges"] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update Badge");
        },
    });
};

export const useDeleteBadge = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteBadgeApi,
        onSuccess: () => {
            toast.success("Badge deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ["badges"] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete Badge");
        },
    });
};