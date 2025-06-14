import httpClient from './httpClient';

// Note: The useUserStore import is not needed here as httpClient handles token injection.

/**
 * Fetch the current authenticated user's profile data.
 * The httpClient will automatically add the Authorization token.
 * Assuming the backend endpoint for the current user's profile is /users/profile (or similar like /auth/me)
 * @returns {Promise<Object>} User Profile object
 * @throws {Error} If the API request fails.
 */
export const fetchUserProfile = async () => {
  try {
    // Adjust endpoint if necessary, e.g., '/auth/me' or '/users/profile'
    const response = await httpClient.get('/users/profile'); 
    // Assuming backend response is { success: true, data: { ...userProfile } }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user profile:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Fetch all users data (Admin operation).
 * @returns {Promise<Array>} Array of users
 */
export const fetchAllUsers = async () => { // Renamed for clarity
  try {
    const response = await httpClient.get('/user/users'); // Assuming endpoint is /users for admin
    // Assuming backend response is { success: true, data: { users: [], pagination: {} } } or just { success: true, data: [] }
    return response.data.data.users || response.data.data; 
  } catch (error) {
    console.error('Error fetching all users:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Delete a user by ID (Admin operation).
 * @param {number|string} userId
 * @returns {Promise<Object>} Response data, typically a success message.
 */
export const deleteUserByID = async (userId) => {
  try {
    const response = await httpClient.delete(`/user/${userId}`); // Assuming endpoint is /users/:id for admin
    return response.data; // Assuming backend returns { success: true, message: '...' }
  } catch (error) {
    console.error(`Error deleting user ID ${userId}:`, error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Create a new user (Admin operation).
 * @param {Object} userData - Data for the new user.
 * @returns {Promise<Object>} The created user data.
 */
export const createUser = async (userData) => {
  try {
    const response = await httpClient.post('/user', userData); // Assuming endpoint is /users for admin
    // Assuming backend response is { success: true, data: { ...createdUser } }
    return response.data.data;
  } catch (error) {
    console.error('Error creating user:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get a specific user by ID (Admin operation).
 * @param {number|string} userId
 * @returns {Promise<Object>} User data.
 */
export const fetchUserById = async (userId) => { // Renamed for clarity
  try {
    const response = await httpClient.get(`/user/${userId}`); // Assuming endpoint is /users/:id for admin
    // Assuming backend response is { success: true, data: { ...userData } }
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching user ID ${userId}:`, error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Update a user by ID (Admin operation or self-update).
 * @param {number|string} userId - ID of the user to update.
 * @param {Object} userData - Data to update.
 * @returns {Promise<Object>} The updated user data.
 */
export const updateUser = async (userId, userData) => {
  try {
    // If this can also be a self-update, the endpoint might be /users/profile or /users/me
    // If it's strictly admin, /users/:userId is fine.
    const response = await httpClient.put(`/user/${userId}`, userData); 
    // Assuming backend response is { success: true, data: { ...updatedUser } }
    return response.data.data;
  } catch (error) {
    console.error(`Error updating user ID ${userId}:`, error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Update the current authenticated user's own profile.
 * @param {Object} profileData - Data to update for the current user's profile.
 * @returns {Promise<Object>} The updated user profile data.
 */
export const updateUserProfile = async (profileData) => {
  try {
    // Common endpoint for self-update is often /users/profile or /auth/profile
    const response = await httpClient.put('/users/profile', profileData); 
    // Assuming backend response is { success: true, data: { ...updatedUserProfile } }
    return response.data.data;
  } catch (error) {
    console.error('Error updating own user profile:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Change the current authenticated user's password.
 * @param {Object} passwords - Object containing current and new passwords.
 * @param {string} passwords.currentPassword - The user's current password.
 * @param {string} passwords.newPassword - The user's new password.
 * @returns {Promise<Object>} Response data, typically a success message or status.
 */
export const changeUserPassword = async ({ currentPassword, newPassword }) => {
  try {
    // The backend endpoint for changing password needs to be confirmed.
    // Common patterns are /users/change-password, /auth/change-password, or /users/me/password
    const response = await httpClient.post('/users/change-password', { currentPassword, newPassword });
    // Assuming backend returns { success: true, message: 'Password changed successfully' } or similar
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};
