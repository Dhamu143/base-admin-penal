import { useState } from "react";
import httpService from "../common/http.service"; // Import your service
import { toast } from "react-toastify";

export default function useApi() {
  const [loading, setLoading] = useState(false);

  // Helper to execute the promise and handle UI feedback
  const execute = async (apiCall) => {
    setLoading(true);
    try {
      const response = await apiCall();
      return { success: true, data: response.data };
    } catch (error) {
      // Your httpService throws an Error object with the message directly
      const message = error.message || "Something went wrong";
      toast.error(message);
      console.error("API Error:", error);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Wrapper for POST requests.
   * Handles the unique signature of your httpService: post(url, params, payload)
   */
  const post = (url, bodyData) => {
    // IMPORTANT: We pass 'null' for params so 'bodyData' goes to the payload slot
    return execute(() => httpService.post(url, null, bodyData));
  };

  /**
   * Wrapper for GET requests.
   */
  const get = (url, params = {}) => {
    return execute(() => httpService.get(url, params));
  };

  return { loading, post, get };
}