import HttpService from "../common/http.service"; 
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await HttpService.post("/admin/upload", {}, formData);

    if (response.data && response.data.issuccess) {
      return response.data.data.url;
    } else {
      throw new Error(response.data.message || "Upload failed");
    }
  } catch (error) {
    console.error("Upload Service Error:", error);
   
    throw error;
  }
};
