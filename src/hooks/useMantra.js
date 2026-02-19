import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import httpService from "../common/http.service";
import { toast } from "react-toastify";

const fetchMantrasApi = async (params = {}) => {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const queryString = new URLSearchParams(cleanParams).toString();
  const url = queryString ? `/mantra?${queryString}` : "/mantra";

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

const fetchMantraByIdApi = async (id) => {
  const response = await httpService.get(`/mantra/${id}`);
  return response.data?.data || response.data;
};

const addMantraApi = async (data) => {
  const response = await httpService.post("/mantra/create", {}, data);
  return response.data?.data;
};

const updateMantraApi = async ({ id, ...data }) => {
  const response = await httpService.put(`/mantra/${id}`, {}, data);
  return response.data?.data;
};

const deleteMantraApi = async (id) => {
  const response = await httpService.delete(`/mantra/${id}`);
  return response.data;
};

export const useMantras = (filters) => {
  return useQuery({
    queryKey: ["mantras", filters],
    queryFn: () => fetchMantrasApi(filters),

    // 🔥 Important fix
    staleTime: 0,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

export const useMantra = (id) => {
  return useQuery({
    queryKey: ["mantra", id],
    queryFn: () => fetchMantraByIdApi(id),
    enabled: !!id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

export const useAddMantra = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addMantraApi,

    onSuccess: (newMantra) => {
      toast.success("Mantra added successfully!");

      queryClient.setQueriesData(
        { queryKey: ["mantras"], exact: false },
        (oldData) => {
          if (!oldData || !oldData.data) return oldData;

          return {
            ...oldData,
            data: [newMantra, ...oldData.data],
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["mantras"] });

      queryClient.invalidateQueries({
        queryKey: ["dashboardStats"],
        refetchType: "none",
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add Mantra");
    },
  });
};

export const useUpdateMantra = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMantraApi,

    onSuccess: () => {
      toast.success("Mantra updated successfully!");

      queryClient.invalidateQueries({ queryKey: ["mantras"] });

      queryClient.invalidateQueries({
        queryKey: ["dashboardStats"],
        refetchType: "none",
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update Mantra");
    },
  });
};

export const useDeleteMantra = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMantraApi,

    onSuccess: () => {
      toast.success("Mantra deleted successfully.");

      queryClient.invalidateQueries({ queryKey: ["mantras"] });

      queryClient.invalidateQueries({
        queryKey: ["dashboardStats"],
        refetchType: "none",
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete Mantra");
    },
  });
};
