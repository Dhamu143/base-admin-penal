import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

// --- API Functions ---

// 1. Fetch List API
const fetchGodsListApi = async (params = {}) => {
    const queryString = new URLSearchParams(
        Object.fromEntries(
            Object.entries(params).filter(
                ([_, v]) => v !== "" && v !== undefined && v !== null
            )
        )
    ).toString();

    const url = queryString ? `/god?${queryString}` : "/god";
    const response = await httpService.get(url);

    // Return the specific data structure expected by the UI
    return response.data?.data;
};

// 2. Fetch Single API
const fetchGodByIdApi = async (id) => {
    const response = await httpService.get(`/god/${id}`);
    return response.data?.data || response.data;
};

// 3. Add API
const addGodApi = async (data) => {
    const response = await httpService.post("/god/create", {}, data);
    return response.data?.data;
};

// 4. Update API
const updateGodApi = async ({ id, ...data }) => {
    const response = await httpService.put(`/god/${id}`, {}, data);
    return response.data?.data;
};

// 5. Delete API
const deleteGodApi = async (id) => {
    const response = await httpService.delete(`/god/${id}`);
    return response.data;
};

// --- React Query Hooks ---

// ✅ 1. Fetch List Hook (Missing in your previous code)
export const useGodsList = (filters) => {
    return useQuery({
        queryKey: ["godsList", filters], // Matches the key invalidated below
        queryFn: () => fetchGodsListApi(filters),

        // Optimization: Fetch once, cache forever (until mutation)
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        keepPreviousData: true,
    });
};

// 2. Fetch Single God (For Edit Mode)
export const useGod = (id) => {
    return useQuery({
        queryKey: ["god", id],
        queryFn: () => fetchGodByIdApi(id),
        enabled: !!id,

        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });
};

// 3. Add God Mutation
export const useAddGod = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addGodApi,
        onSuccess: () => {
            toast.success("God added successfully!");
            // 🚀 Refetch the list now that we added an item
            queryClient.invalidateQueries(["godsList"]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to add God.");
        },
    });
};

// 4. Update God Mutation
export const useUpdateGod = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateGodApi,
        onSuccess: (data, variables) => {
            // 🚀 Refetch list AND the specific item to update details
            queryClient.invalidateQueries(["godsList"]);
            queryClient.invalidateQueries(["god", variables.id]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update God.");
        },
    });
};

// 5. Delete God Mutation
export const useDeleteGod = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteGodApi,
        onSuccess: () => {
            toast.success("God deleted successfully!");
            queryClient.invalidateQueries(["godsList"]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete God.");
        },
    });
};