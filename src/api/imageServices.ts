import httpClient from "./httpClient";

export const uploadImageToCloud = async (data: FormData) => {
  try {
    const response = await httpClient.post("/image", data);
    // Assuming backend response is { success: true, data: { ...createdUser } }

    return response.data;
  } catch (error) {
    console.error(
      "Error uploading image:",
      error.response?.data?.message || error.message
    );
    throw error.response?.data || error;
  }
};
