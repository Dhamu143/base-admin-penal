import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

// --- API Functions ---

const fetchAartisApi = async (params = {}) => {
    const queryString = new URLSearchParams(
        Object.fromEntries(
            Object.entries(params).filter(
                ([_, v]) => v !== "" && v !== undefined && v !== null
            )
        )
    ).toString();

    const url = queryString ? `/aarti?${queryString}` : "/aarti";
    const response = await httpService.get(url);

    return response.data?.data;
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

// --- React Query Hooks ---

// 1. Fetch List (Optimized)
export const useAartis = (filters) => {
    return useQuery({
        queryKey: ["aartis", filters],
        queryFn: () => fetchAartisApi(filters),

        // ✅ "Fetch Once, Cache Forever" Logic
        staleTime: Infinity,
        refetchOnWindowFocus: false,

        keepPreviousData: true,
    });
};

// 2. Fetch Single Detail (Optimized)
export const useAarti = (id) => {
    return useQuery({
        queryKey: ["aarti", id],
        queryFn: () => fetchAartiByIdApi(id),
        enabled: !!id,

        // ✅ Cache details too so navigating back to edit page is instant
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });
};

// 3. Mutations (These force the updates)

export const useAddAarti = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addAartiApi,
        onSuccess: () => {
            toast.success("Aarti added successfully!");
            // 🚀 Forces a refetch because user added data
            queryClient.invalidateQueries(["aartis"]);
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
        onSuccess: (data, variables) => {
            // 🚀 Forces a refetch because user changed data
            queryClient.invalidateQueries(["aartis"]);
            queryClient.invalidateQueries(["aarti", variables.id]);
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
            toast.success("Deleted successfully.");
            // 🚀 Forces a refetch because user deleted data
            queryClient.invalidateQueries(["aartis"]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete Aarti");
        },
    });
};