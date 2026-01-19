import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

// --- API Functions ---

const fetchQuizzesApi = async (params = {}) => {
    const queryString = new URLSearchParams(
        Object.fromEntries(
            Object.entries(params).filter(
                ([_, v]) => v !== "" && v !== null && v !== undefined
            )
        )
    ).toString();

    const url = queryString ? `/quiz?${queryString}` : "/quiz";
    const response = await httpService.get(url);

    // Normalize Data Structure
    const apiData = response.data;

    // 1. Nested: { data: { data: [...], pagination: {...} } }
    if (apiData?.data?.data && Array.isArray(apiData.data.data)) {
        return apiData.data;
    }

    // 2. Intermediate: { data: [...] }
    if (apiData?.data && Array.isArray(apiData.data)) {
        return { data: apiData.data, pagination: apiData.pagination || null };
    }

    // 3. Fallback: { [...] }
    if (Array.isArray(apiData)) {
        return { data: apiData, pagination: null };
    }

    return { data: [], pagination: null };
};

const fetchQuizByIdApi = async (id) => {
    const response = await httpService.get(`/quiz/${id}`);
    return response.data?.data || response.data;
};

const addQuizApi = async (data) => {
    const response = await httpService.post("/quiz/create", {}, data);
    return response.data?.data;
};

const updateQuizApi = async ({ id, ...data }) => {
    const response = await httpService.put(`/quiz/${id}`, {}, data);
    return response.data?.data;
};

const deleteQuizApi = async (id) => {
    const response = await httpService.delete(`/quiz/${id}`);
    return response.data;
};

// --- React Query Hooks ---

// 1. Fetch List (Read)
export const useQuizzes = (filters) => {
    return useQuery({
        queryKey: ["quizzes", filters],
        queryFn: () => fetchQuizzesApi(filters),

        // ✅ Optimization: Fetch once, keep forever (until mutation/reset)
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        keepPreviousData: true,
    });
};

// 2. Fetch Single (Read)
export const useQuiz = (id) => {
    return useQuery({
        queryKey: ["quiz", id],
        queryFn: () => fetchQuizByIdApi(id),
        enabled: !!id,

        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });
};

// 3. Add Mutation (Write)
export const useAddQuiz = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addQuizApi,
        onSuccess: () => {
            toast.success("Quiz added successfully!");
            queryClient.invalidateQueries(["quizzes"]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to add Quiz");
        },
    });
};

// 4. Update Mutation (Write)
export const useUpdateQuiz = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateQuizApi,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["quizzes"]);
            queryClient.invalidateQueries(["quiz", variables.id]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update Quiz");
        },
    });
};

// 5. Delete Mutation (Write)
export const useDeleteQuiz = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteQuizApi,
        onSuccess: () => {
            toast.success("Quiz deleted successfully.");
            queryClient.invalidateQueries(["quizzes"]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete Quiz");
        },
    });
};