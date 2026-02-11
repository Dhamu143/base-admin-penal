import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";


const fetchArticlesApi = async (params = {}) => {
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});

    const queryString = new URLSearchParams(cleanParams).toString();
        const url = queryString ? `/articles?${queryString}` : "/articles";


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

const fetchArticleByIdApi = async (id) => {
    const response = await httpService.get(`/articles/${id}`);
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

export const useArticles = (filters) => {
    return useQuery({
        queryKey: ["articles", filters],
        queryFn: () => fetchArticlesApi(filters),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    });
};

export const useArticle = (id) => {
    return useQuery({
        queryKey: ["article", id],
        queryFn: () => fetchArticleByIdApi(id),
        enabled: !!id,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });
};

export const useAddArticle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addArticleApi,
        onSuccess: () => {
            toast.success("Article added successfully!");
            queryClient.invalidateQueries({ queryKey: ["articles"] });
            queryClient.invalidateQueries({
                queryKey: ["dashboardStats"],
                refetchType: "none"
            });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to add article");
        },
    });
};

export const useUpdateArticle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateArticleApi,
        onSuccess: (updatedData, variables) => {
            queryClient.invalidateQueries({ queryKey: ["articles"] });
            queryClient.setQueryData(["article", variables.id], updatedData);

            queryClient.invalidateQueries({
                queryKey: ["dashboardStats"],
                refetchType: "none"
            });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update article");
        },
    });
};

export const useDeleteArticle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteArticleApi,
        onSuccess: () => {
            toast.success("Article deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ["articles"] });
            queryClient.invalidateQueries({
                queryKey: ["dashboardStats"],
                refetchType: "none"
            });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete article");
        },
    });
};