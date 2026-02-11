import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

const fetchUsersApi = async (params = {}) => {
  const response = await httpService.get("/users", params);

  const apiData = response.data;
  if (apiData?.data?.data && Array.isArray(apiData.data.data)) {
    return {
      users: apiData.data.data,
      pagination: apiData.data.pagination || null
    };
  }

  if (apiData?.data && Array.isArray(apiData.data)) {
    return { users: apiData.data, pagination: apiData.pagination || null };
  }

  return { users: [], pagination: null };
};

const deleteUserApi = async (id) => {
  const response = await httpService.delete(`/users/${id}`);
  return response.data;
};


export const useUsers = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["users", page, limit],
    queryFn: () => fetchUsersApi({ page, limit }),

    staleTime: Infinity,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      toast.success("User deleted successfully.");
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["dashboardStats"]);

    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete user");
    },
  });
};