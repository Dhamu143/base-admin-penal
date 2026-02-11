import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

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

export const useGods = (page = 1, limit = 10) => {
    return useQuery({
        queryKey: ["gods", page, limit],
        queryFn: () => fetchGodsApi({ page, limit }),

        staleTime: Infinity,
        keepPreviousData: true,
        refetchOnWindowFocus: false,
    });
};

export const useAddGod = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addGodApi,
        onSuccess: () => {
            toast.success("God added successfully!");
            queryClient.invalidateQueries(["gods"]);
            queryClient.invalidateQueries(["dashboardStats"]);

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
            queryClient.invalidateQueries(["gods"]);
            queryClient.invalidateQueries(["dashboardStats"]);

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
            queryClient.invalidateQueries(["gods"]);
            queryClient.invalidateQueries(["dashboardStats"]);

        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete god.");
        },
    });
};