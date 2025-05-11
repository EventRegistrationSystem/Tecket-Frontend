// src/api/authRefresh.js
import { refreshAccessToken } from './auth.js';
import { useUserStore } from '@/store/user.js';

/**
 * Wrapper around fetch that adds Authorization header,
 * attempts refresh on 401, and retries once.
 */
export async function authFetch(input, init = {}) {
  const userStore = useUserStore();

  // Merge headers: JSON + Bearer token
  init.headers = {
    'Content-Type': 'application/json',
    ...(init.headers || {}),
    'Authorization': `Bearer ${userStore.accessToken}`,
  };

  // If cookies are needed:
  // init.credentials = 'include';

  // First attempt
  let response = await fetch(input, init);

  // If Unauthorized, try refresh once
  if (response.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      userStore.setAccessToken(newToken);

      // Retry original request with new token
      init.headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(input, init);
    } catch (err) {
      // Refresh failed: clear tokens and redirect to login
      userStore.clearAccessToken();
      window.location.href = '/signIn';
      throw err;
    }
  }

  return response;
}
