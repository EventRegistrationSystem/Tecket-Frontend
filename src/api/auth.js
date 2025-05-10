// src/api/auth.js
const API_BASE_URL = 'https://eventregistrationsystem-backend.onrender.com/api';
export const BASE_URL = API_BASE_URL || import.meta.env.VITE_API_BASE_URL;

/**
 * Call refresh-token endpoint to get a new accessToken.
 * Browser will send HTTP-only cookie automatically if credentials include is set.
 */
export async function refreshAccessToken() {
  const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Failed to refresh token');
  }
  // Backend returns { success:true, data:{ accessToken: '...' } }
  return json.data.accessToken;
}

