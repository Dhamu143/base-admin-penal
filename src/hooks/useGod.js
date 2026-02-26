import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

const fetchGodsListApi = async (params = {}) => {
    const queryString = new URLSearchParams(
        Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== "" && v !== undefined && v !== null)
        )
    ).toString();
    const url = queryString ? `/god?${queryString}` : "/god";
    const response = await httpService.get(url);
    return response.data?.data;
};

const fetchAllGodsApi = async () => {
    const response = await httpService.get("/god?limit=1000");
    return response.data?.data?.data || [];
};

const fetchGodByIdApi = async (id) => {
    const response = await httpService.get(`/god/${id}`);
    return response.data?.data || response.data;
};

const addGodApi = async (data) => {
    const response = await httpService.post("/god/create", {}, data);
    return response.data?.data;
};

const updateGodApi = async ({ id, ...data }) => {
    const response = await httpService.put(`/god/${id}`, {}, data);
    return response.data?.data;
};

const deleteGodApi = async (id) => {
    const response = await httpService.delete(`/god/${id}`);
    return response.data;
};

export const useGodsList = (filters) => {
    return useQuery({
        queryKey: ["godsList", filters],
        queryFn: () => fetchGodsListApi(filters),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useAllGods = () => {
    return useQuery({
        queryKey: ["gods", "all"],
        queryFn: fetchAllGodsApi,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useGod = (id) => {
    return useQuery({
        queryKey: ["god", id],
        queryFn: () => fetchGodByIdApi(id),
        enabled: !!id,
        staleTime: Infinity,
    });
};

export const useAddGod = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addGodApi,
        onSuccess: () => {
            toast.success("God added successfully!");
            queryClient.invalidateQueries(["godsList"]);
            queryClient.invalidateQueries(["gods", "all"]);
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to add God."),
    });
};

export const useUpdateGod = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateGodApi,
        onSuccess: (data, variables) => {
            toast.success("God updated successfully!");
            queryClient.invalidateQueries(["godsList"]);
            queryClient.invalidateQueries(["gods", "all"]);
            queryClient.invalidateQueries(["god", variables.id]);
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to update God."),
    });
};

export const useDeleteGod = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteGodApi,
        onSuccess: () => {
            toast.success("God deleted successfully!");
            queryClient.invalidateQueries(["godsList"]);
            queryClient.invalidateQueries(["gods", "all"]);
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to delete God."),
    });
};