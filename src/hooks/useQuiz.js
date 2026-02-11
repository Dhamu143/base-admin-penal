import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";


const fetchQuizzesApi = async (params = {}) => {
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});

    const queryString = new URLSearchParams(cleanParams).toString();
    const url = queryString ? `/quiz?${queryString}` : "/quiz";
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


export const useQuizzes = (filters) => {
    return useQuery({
        queryKey: ["quizzes", filters],
        queryFn: () => fetchQuizzesApi(filters),

        staleTime: 5 * 60 * 1000, 
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    });
};
export const useAddQuiz = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addQuizApi,
        onSuccess: () => {
            toast.success("Quiz added successfully!");
            queryClient.invalidateQueries({ queryKey: ["quizzes"] });

            queryClient.invalidateQueries({
                queryKey: ["dashboardStats"],
                refetchType: "none"
            });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to add Quiz");
        },
    });
};

export const useUpdateQuiz = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateQuizApi,
        onSuccess: (updatedData, variables) => {
            queryClient.invalidateQueries({ queryKey: ["quizzes"] });
            queryClient.setQueryData(["quiz", variables.id], updatedData);

            queryClient.invalidateQueries({
                queryKey: ["dashboardStats"],
                refetchType: "none"
            });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update Quiz");
        },
    });
};

export const useDeleteQuiz = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteQuizApi,
        onSuccess: () => {
            toast.success("Quiz deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ["quizzes"] });
            queryClient.invalidateQueries({
                queryKey: ["dashboardStats"],
                refetchType: "none"
            });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete Quiz");
        },
    });
};