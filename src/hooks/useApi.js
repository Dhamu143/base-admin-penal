import { useState } from "react";
import httpService from "../common/http.service"; 
import { toast } from "react-toastify";

export default function useApi() {
  const [loading, setLoading] = useState(false);

  const execute = async (apiCall) => {
    setLoading(true);
    try {
      const response = await apiCall();
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.message || "Something went wrong";
      toast.error(message);
      console.error("API Error:", error);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };
  const post = (url, bodyData) => {
    return execute(() => httpService.post(url, null, bodyData));
  };

    const get = (url, params = {}) => {
    return execute(() => httpService.get(url, params));
  };

  return { loading, post, get };
}