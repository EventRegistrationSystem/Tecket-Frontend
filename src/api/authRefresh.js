// src/api/authRefresh.js
import { refreshAccessToken } from './auth.js';
import { useUserStore } from '@/store/user.js';

/**
 * Wrapper around fetch that adds Authorization header,
 * attempts refresh on 401, and retries once.
 */
export async function authFetch(input, init = {}) {
  const userStore = useUserStore();

  // Merge headers, always JSON + Bearer token
  init.headers = {
    'Content-Type': 'application/json',
    ...(init.headers || {}),
    'Authorization': `Bearer ${userStore.accessToken}`
  };
  // If you need to bring Cookie, also add:
  //  init.credentials = 'include';

  let res = await fetch(input, init);

  // if (res.status === 401) {
  //   try {
  //     const newToken = await refreshAccessToken();
  //     userStore.setAccessToken(newToken);

  //     // Retry original request with new token
  //     init.headers['Authorization'] = `Bearer ${newToken}`;
  //     res = await fetch(input, init);
  //   } catch (err) {

  //     userStore.clearAccessToken();
  //     window.location.href = '/signIn';
  //     throw err;
  //   }
  // }

  return res;
}
