import httpClient from './httpClient';


export const sendEmail = async (data,eventData) => {
  try {
    const response = await httpClient.post('/email', data, eventData); // Assuming endpoint is /users for admin
    // Assuming backend response is { success: true, data: { ...createdUser } }

    return response.data;
  } catch (error) {
    console.error('Error creating user:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};