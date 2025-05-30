import httpClient from './httpClient';


export const sendEmail = async (data) => {
  try {
    const response = await httpClient.post('/email', data);
    // Assuming backend response is { success: true, data: { ...createdUser } }

    return response.data;
  } catch (error) {
    console.error('Error creating user:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};