import HttpService from "../common/http.service"; // Adjust this path to where your HttpService file is located

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    // HttpService.post(url, params, payload)
    // We pass empty object {} for params, and formData for payload.
    // The Service automatically handles the Authorization token and Content-Type.
    const response = await HttpService.post("/admin/upload", {}, formData);

    // Validate based on your specific API response structure
    if (response.data && response.data.issuccess) {
      return response.data.data.url;
    } else {
      throw new Error(response.data.message || "Upload failed");
    }
  } catch (error) {
    console.error("Upload Service Error:", error);
    // The HttpService interceptor already formats the error message,
    // so we just re-throw it here for the UI to catch.
    throw error;
  }
};
