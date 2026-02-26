import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

const fetchAdminPostsApi = async (params = {}) => {
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});

    const queryString = new URLSearchParams(cleanParams).toString();
    const url = queryString ? `/posts/admin/all?${queryString}` : "/posts/admin/all";

    const response = await httpService.get(url);

    return {
        data: response.data?.data || [],
        total: response.data?.total || 0,
        totalPages: response.data?.totalPages || 1,
        currentPage: response.data?.currentPage || 1,
    };
};

const createPostApi = async (formData) => {
    const response = await httpService.post("/posts/create", {}, formData);
    return response.data?.data;
};

const verifyPostApi = async ({ id, isVerified }) => {
    const response = await httpService.put(`/posts/admin/verify/${id}`, {}, { isVerified });
    return response.data?.data;
};

const deletePostApi = async (id) => {
    const response = await httpService.delete(`/posts/${id}`);
    return response.data;
};

export const useAdminPosts = (filters) => {
    return useQuery({
        queryKey: ["adminPosts", filters],
        queryFn: () => fetchAdminPostsApi(filters),
        staleTime: 0,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    });
};

export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPostApi,
        onSuccess: () => {
            toast.success("Post created successfully!");
            queryClient.invalidateQueries({ queryKey: ["adminPosts"] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Could not create post.");
        },
    });
};

export const useVerifyPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: verifyPostApi,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["adminPosts"] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Could not verify post.");
        },
    });
};

export const useDeletePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePostApi,
        onSuccess: () => {
            toast.success("Post deleted successfully. 🗑️");
            queryClient.invalidateQueries({ queryKey: ["adminPosts"] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Could not delete post.");
        },
    });
};