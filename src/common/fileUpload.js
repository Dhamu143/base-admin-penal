import httpService from "./http.service";
import axios from "axios";

export const FileUpload = async (payload) => {
  try {
    const formData = new FormData();
    formData.append("files", payload);
    const http = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const response = await http.post("/api/uploadfile", formData);
    return await response.data;
  } catch (error) {
    // toast.error(error?.message);
  }
};
