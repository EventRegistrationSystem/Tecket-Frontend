import httpClient from './httpClient';

// The BASE_URL is now configured within httpClient.js
// The refreshAccessToken logic is now handled by httpClient's interceptors.

/**
 * Logs in a user.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} The user data and access token.
 * e.g. { user: { id, email, firstName, lastName, role }, accessToken: '...' }
 */
export const loginUser = async (email, password) => {
  try {
    const response = await httpClient.post('/auth/login', { email, password });
    // Assuming backend returns { success: true, data: { user, accessToken } }
    return response.data.data;
  } catch (error) {
    // The interceptor might have already processed the error.
    // Re-throw a structured error or the error itself for the component to handle.
    console.error('Login failed:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Registers a new user.
 * @param {Object} userData - User registration data.
 * @param {string} userData.email
 * @param {string} userData.password
 * @param {string} userData.firstName
 * @param {string} userData.lastName
 * @param {string} [userData.phoneNo] - Optional
 * @returns {Promise<Object>} The newly created user data and access token.
 */
export const registerUser = async (userData) => {
  try {
    const response = await httpClient.post('/auth/register', userData);
    // Assuming backend returns { success: true, data: { user, accessToken } }
    return response.data.data;
  } catch (error) {
    console.error('Registration failed:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Logs out the current user.
 * The request interceptor in httpClient will add the Bearer token.
 * The backend /auth/logout endpoint is expected to clear the httpOnly refresh token cookie.
 * @returns {Promise<Object>} The logout success message.
 */
export const logoutUser = async () => {
  try {
    // The request interceptor in httpClient adds the Bearer token and sets withCredentials for /auth/logout.
    const response = await httpClient.post('/auth/logout');
    // Assuming backend returns { success: true, message: 'Logged out successfully' }
    return response.data;
  } catch (error) {
    console.error('Logout failed:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};
