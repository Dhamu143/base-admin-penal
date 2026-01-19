import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

// --- API Functions ---

const fetchArticlesApi = async (params = {}) => {
    const queryString = new URLSearchParams(
        Object.fromEntries(
            Object.entries(params).filter(
                ([_, v]) => v !== "" && v !== undefined && v !== null
            )
        )
    ).toString();

    const url = queryString ? `/articles?${queryString}` : "/articles";
    const response = await httpService.get(url);

    // Expected return: { data: [...], pagination: {...} }
    return response.data?.data;
};

const fetchArticleByIdApi = async (id) => {
    const response = await httpService.get(`/articles/${id}`);
    // Adjust based on your API: usually response.data.data is the object
    return response.data?.data || response.data;
};

const addArticleApi = async (data) => {
    const response = await httpService.post("/articles/create", {}, data);
    return response.data?.data;
};

const updateArticleApi = async ({ id, ...data }) => {
    const response = await httpService.put(`/articles/${id}`, {}, data);
    return response.data?.data;
};

const deleteArticleApi = async (id) => {
    const response = await httpService.delete(`/articles/${id}`);
    return response.data;
};

// --- React Query Hooks ---

// 1. Fetch List
export const useArticles = (filters) => {
    return useQuery({
        queryKey: ["articles", filters],
        queryFn: () => fetchArticlesApi(filters),

        // ✅ Optimization: Fetch once, keep forever (until mutation or manual refresh)
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        keepPreviousData: true,
    });
};

// 2. Fetch Single (For Edit Mode)
export const useArticle = (id) => {
    return useQuery({
        queryKey: ["article", id],
        queryFn: () => fetchArticleByIdApi(id),
        enabled: !!id,

        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });
};

// 3. Add Mutation
export const useAddArticle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addArticleApi,
        onSuccess: () => {
            toast.success("Article added successfully!");
            queryClient.invalidateQueries(["articles"]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to add article");
        },
    });
};

// 4. Update Mutation
export const useUpdateArticle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateArticleApi,
        onSuccess: (data, variables) => {
            // Refresh list AND the specific article details
            queryClient.invalidateQueries(["articles"]);
            queryClient.invalidateQueries(["article", variables.id]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update article");
        },
    });
};

// 5. Delete Mutation
export const useDeleteArticle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteArticleApi,
        onSuccess: () => {
            toast.success("Article deleted successfully.");
            queryClient.invalidateQueries(["articles"]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete article");
        },
    });
};