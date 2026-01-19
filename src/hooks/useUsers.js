import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

// --- API Functions ---

const fetchUsersApi = async (params = {}) => {
  // Pass params directly; httpService handles object-to-query-string conversion
  const response = await httpService.get("/users", params);

  const apiData = response.data;

  // Normalize Data Structure based on your Redux slice logic
  // Case 1: Standard Paginated Response { data: { data: [...], pagination: {...} } }
  if (apiData?.data?.data && Array.isArray(apiData.data.data)) {
    return { 
      users: apiData.data.data, 
      pagination: apiData.data.pagination || null 
    };
  }
  
  // Case 2: Intermediate { data: [...] }
  if (apiData?.data && Array.isArray(apiData.data)) {
    return { users: apiData.data, pagination: apiData.pagination || null };
  }

  // Fallback
  return { users: [], pagination: null };
};

const deleteUserApi = async (id) => {
  const response = await httpService.delete(`/users/${id}`);
  return response.data;
};

// --- React Query Hooks ---

// 1. Fetch Users List (Read)
export const useUsers = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["users", page, limit],
    queryFn: () => fetchUsersApi({ page, limit }),
    
    // ✅ Optimization: Fetch once, keep forever (until mutation/refresh)
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};

// 2. Delete User Mutation (Write)
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      toast.success("User deleted successfully.");
      // 🚀 Force refresh the list
      queryClient.invalidateQueries(["users"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete user");
    },
  });
};