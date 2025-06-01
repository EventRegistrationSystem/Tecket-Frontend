import axios from 'axios';
import { useUserStore } from '@/store/userStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://eventregistrationsystem-backend.onrender.com/api';

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    // 'Content-Type': 'application/json',
  },
});

// Request Interceptor: Adds the Authorization token to requests
httpClient.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();

    // Only add Authorization header if it's not a public view request
    if (userStore.accessToken && !config.publicView) {
      config.headers['Authorization'] = `Bearer ${userStore.accessToken}`;
    }

    // Ensure 'withCredentials' is set for specific cookie-dependent requests
    if (config.url === '/auth/refresh-token' || config.url === '/auth/logout') {
      config.withCredentials = true;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handles token refresh on 401 and global error aspects
httpClient.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    const originalRequest = error.config;
    const userStore = useUserStore();

    // Check for 401 Unauthorized and if it's not a retry already,
    // and not the refresh token request itself that failed with 401 (to avoid infinite loop)
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token' && originalRequest.url !== '/auth/login') {
      originalRequest._retry = true; // Mark as retried to prevent infinite loops

      try {
        console.log('Attempting to refresh access token...');

        // Make sure the refresh token call itself uses `withCredentials`
        const { data } = await httpClient.post('/auth/refresh-token');
        const newAccessToken = data.data.accessToken;

        userStore.setAccessToken(newAccessToken);

        // Update the Authorization header for the original request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return httpClient(originalRequest); // Retry the original request
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);

        // If refresh token fails, clear session and redirect to login
        userStore.clearUserSession();
        window.location.href = '/signIn';
        return Promise.reject(refreshError);
      }
    }

    // If the error was on the refresh-token endpoint itself (e.g. refresh token invalid)
    if (error.response?.status === 401 && originalRequest.url === '/auth/refresh-token') {
      console.error('Refresh token is invalid or expired. This was a 401 on /auth/refresh-token itself.');
      userStore.clearUserSession();
      window.location.href = '/signIn';
    }

    return Promise.reject(error);
  }
);

export default httpClient;
