# Frontend-Backend Integration Progress Summary

This document tracks the progress of standardizing and refactoring the frontend application's communication with the backend API.

## Date: 2025-05-16

## I. Completed Tasks: Authentication Module Refactoring

The primary goal was to standardize how the frontend handles authentication, API calls, user sessions, and routing related to authentication.

**1. Centralized HTTP Client (Axios):**
    *   **File Created:** `src/api/httpClient.js`
    *   **Details:**
        *   An Axios instance (`httpClient`) was created and configured with a base URL (using environment variables with a fallback).
        *   **Request Interceptor:** Automatically injects the `Authorization: Bearer <token>` header into outgoing requests using the access token from the Pinia user store. It also sets `withCredentials: true` for specific cookie-dependent requests like `/auth/refresh-token` and `/auth/logout`.
        *   **Response Interceptor:**
            *   Handles automatic token refresh: If an API call returns a 401 (Unauthorized) error (and it's not the refresh token call itself failing), it attempts to call the `/auth/refresh-token` endpoint.
            *   If refresh is successful, the new access token is stored, and the original failed request is retried.
            *   If refresh fails (or if the refresh token endpoint itself returns 401), the user session is cleared, and the user is redirected to the sign-in page.
            *   Passes through other successful responses and errors.

**2. Refactored Authentication Services:**
    *   **File Updated:** `src/api/authServices.js`
    *   **Details:**
        *   Now uses the new `httpClient` for all its API calls.
        *   Provides standardized functions: `loginUser(email, password)`, `registerUser(userData)`, and `logoutUser()`.
        *   The previous `fetch`-based `refreshAccessToken` function was removed as this logic is now handled by the `httpClient`'s response interceptor.

**3. Enhanced User Store (Pinia):**
    *   **File Updated:** `src/store/userStore.js` (previously `user.js`)
    *   **Details:**
        *   State now includes `user` (to store the full user object from the backend) in addition to `accessToken`. Both are initialized from and persisted to `localStorage`.
        *   Added a `setAuthData(userData, token)` action to store both user details and the access token upon login/registration.
        *   Added a `setUser(userData)` action for potentially updating user data.
        *   Added a comprehensive `clearUserSession()` action that clears `accessToken`, `user` from both the store state and `localStorage`.
        *   The `isAuthenticated` getter was corrected to rely on the reactive `state.accessToken`.
        *   Added `currentUser` and `userRole` getters for convenience.

**4. Updated Authentication Views:**
    *   **Files Updated:** `src/views/auth/SignInView.vue` and `src/views/auth/SignUpView.vue`
    *   **Details:**
        *   Refactored to use the new service functions (`loginUser`, `registerUser`) from `authServices.js`.
        *   Utilize the `userStore`'s `setAuthData` action upon successful authentication.
        *   Improved error handling to display messages from API responses.
        *   Added UI feedback for loading states (e.g., on submit buttons).

**5. Updated Navbar for Logout and User Display:**
    *   **File Updated:** `src/components/Navbar.vue`
    *   **Details:**
        *   The `logOut` method now calls the `logoutUser` service from `authServices.js` and uses `userStore.clearUserSession()` for a comprehensive client-side logout.
        *   User's name display now consistently uses `currentUser` from the Pinia store.
        *   Includes logic to fetch user profile information if the user is authenticated but data isn't in the store (e.g., on app load with a persisted session).

**6. Implemented Navigation Guards:**
    *   **File Updated:** `src/router/index.js`
    *   **Details:**
        *   Added a global `router.beforeEach` navigation guard.
        *   Routes intended for authenticated users are now protected using `meta: { requiresAuth: true }`. Some routes also include `meta: { roles: ['ADMIN', 'ORGANIZER'] }` for basic role checking.
        *   Unauthenticated users attempting to access protected routes are redirected to `/signIn`.
        *   Authenticated users attempting to access `/signIn` or `/signUp` are redirected to the home page.
        *   The guard checks the user's role (from `userStore.currentUser.role`) against `meta.roles` for role-protected routes.

## II. Next Steps for Integration

With the authentication module standardized, the next steps involve applying similar principles to other parts of the application that interact with the backend.

**1. Standardize Remaining API Service Files:**
    *   **Files to Review/Refactor:**
        *   `src/api/eventServices.js` (already partially uses `authFetch`, needs to switch to `httpClient` and adopt consistent error handling/data return patterns).
        *   `src/api/userServices.js` (e.g., for `fetchUserProfile`, admin user CRUD).
        *   `src/api/aquestions.js` -> Rename to `questionServices.js` or integrate.
        *   `src/api/atickets.js` -> Rename to `ticketServices.js` or integrate.
        *   `src/api/auser.js` (if different from `userServices.js` or redundant, consolidate).
        *   Any other files in `src/api/` making direct `fetch` calls.
    *   **Actions:**
        *   Ensure all API calls use the central `httpClient` instance.
        *   Adopt a consistent pattern for functions: make the call, return `response.data.data` (or `response.data` if that's the structure), and let the `httpClient` interceptors handle common errors/refresh. Specific error transformations can still occur in the service if needed.

**2. Review and Refactor Components Using These Services:**
    *   Ensure all components that consume these services are updated to:
        *   Call the refactored service functions.
        *   Handle loading states appropriately.
        *   Display errors returned from the services (which will now be more structured due to Axios and the interceptors).

**3. Verify Token Refresh and Session Management:**
    *   Thoroughly test scenarios where the access token might expire to ensure the refresh mechanism in `httpClient` works as expected across different API calls.
    *   Test logout from various parts of the application.

**4. Implement Role-Based Access Control (RBAC) More Granularly:**
    *   While basic role checking is in the router, extend this to UI elements (e.g., conditionally rendering buttons/sections based on `userStore.currentUser.role`).
    *   Ensure backend also enforces these role permissions rigorously.

**5. Global Error Handling/Notifications:**
    *   Consider implementing a global UI notification system (e.g., toasts) that can be triggered by the `httpClient` response interceptor or by components for API errors, providing a consistent user experience for errors.

**6. Environment Variables:**
    *   Ensure all external URLs or configurations (like Stripe publishable keys, if any) are managed via environment variables (`.env` files).

**7. Code Cleanup:**
    *   Remove the old `src/api/authRefresh.js` file as its functionality is now integrated into `httpClient.js`.
    *   Remove any redundant or unused API call implementations.

This summary should provide a good overview of our progress and a roadmap for continuing the integration and refactoring efforts.
