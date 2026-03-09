import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

// --- API Calls ---

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

// NEW: Fetch single quiz by ID
const fetchQuizByIdApi = async (id) => {
    const response = await httpService.get(`/quiz/${id}`);
    // Extracting the data object based on your standard backend response
    return response.data?.data; 
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

export const useQuizzes = (filters) => {
    return useQuery({
        queryKey: ["quizzes", filters],
        queryFn: () => fetchQuizzesApi(filters),
        staleTime: 0,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    });
};

// NEW: Hook to get a single quiz by ID
export const useQuizById = (id) => {
    return useQuery({
        queryKey: ["quiz", id],
        queryFn: () => fetchQuizByIdApi(id),
        enabled: !!id, // Only execute if an ID is provided
        staleTime: 0,
        refetchOnWindowFocus: false,
    });
};

export const useAddQuiz = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addQuizApi,
        onSuccess: () => {
            toast.success("Quiz added successfully!");
            queryClient.invalidateQueries({ queryKey: ["quizzes"], exact: false });
            queryClient.invalidateQueries({ queryKey: ["dashboardStats"], refetchType: "none" });
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
        onSuccess: () => {
            toast.success("Quiz updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["quizzes"], exact: false });
            queryClient.invalidateQueries({ queryKey: ["dashboardStats"], refetchType: "none" });
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
            queryClient.invalidateQueries({ queryKey: ["quizzes"], exact: false });
            queryClient.invalidateQueries({ queryKey: ["dashboardStats"], refetchType: "none" });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete Quiz");
        },
    });
};