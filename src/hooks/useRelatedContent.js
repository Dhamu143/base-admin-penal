import { useQuery } from "@tanstack/react-query";
import httpService from "../common/http.service";

const fetchRelatedContentLists = async () => {
    const response = await httpService.get("/related", {}, {});
    return response.data.data;
};

export const useRelatedContentLists = () => {
    return useQuery({
        queryKey: ["relatedContentLists"],
        queryFn: fetchRelatedContentLists,
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });
};