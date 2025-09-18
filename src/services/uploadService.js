import httpService from "../common/http.service";

export const uploadImage = async (file) => {
  if (!file) throw new Error("No file provided");

  try {
    const formData = new FormData();
    formData.append("image", file); // <-- change this to match backend

    const response = await httpService.post(
      `/admin/upload/image`,
      {},
      formData,
      { "Content-Type": "multipart/form-data" }
    );

    return response.data.data.data.file;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
