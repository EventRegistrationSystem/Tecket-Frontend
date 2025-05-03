// src/api/auth.js
const API_BASE_URL = 'https://eventregistrationsystem-backend.onrender.com/api';
const url = import.meta.env.VITE_API_BASE_URL

/**
 * Call refresh-token endpoint to get a new accessToken.
 * The browser will automatically send the HTTP-only refreshToken cookie.
 */
export async function refreshAccessToken() {
  const res = await fetch(`${url}/auth/refresh-token`, {
    method: 'POST',
//    credentials: 'include'        // ← bring refreshToken cookie 
                                  // This way the browser will automatically store/carry HTTP-only cookies
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message || 'Failed to refresh token')
  }
 // Backend returns { success:true, data:{ accessToken: '...' } }
  return json.data.accessToken
}
