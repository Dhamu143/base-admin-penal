import axios from "axios";

// Define your backend base URL
const API_BASE_URL = "http://192.168.1.200:3001/api";

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    // Update the URL to include the full backend path
    const response = await axios.post(`${API_BASE_URL}/admin/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Validating based on your specific API response structure
    if (response.data && response.data.issuccess) {
      // The image URL is inside data.data.url
      return response.data.data.url;
    } else {
      throw new Error(response.data.message || "Upload failed");
    }
  } catch (error) {
    console.error("Upload Service Error:", error);
    throw error;
  }
};