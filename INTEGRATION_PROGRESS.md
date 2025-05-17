# Frontend-Backend Integration Progress Summary

This document tracks the progress of standardizing and refactoring the frontend application's communication with the backend API.

## Date: 2025-05-16

## I. Completed Tasks: Authentication Module Refactoring

The primary goal was to standardize how the frontend handles authentication, API calls, user sessions, and routing related to authentication.

**1. Centralized HTTP Client (Axios):**
    * **File Created:** `src/api/httpClient.js`
    * **Details:**
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
    *   **COMPLETED (2025-05-17):** `src/api/aquestions.js` (functionality moved to `src/api/questionServices.js`).
    *   **COMPLETED (2025-05-17):** `src/api/atickets.js` (functionality moved to `src/api/ticketServices.js`).
    *   **COMPLETED (2025-05-17):** `src/api/auser.js` (functionality merged into `src/api/userServices.js`).
    *   **COMPLETED (2025-05-17):** `src/api/authRefresh.js` (functionality superseded by interceptors in `src/api/httpClient.js`).
    *   **Status:** Frontend API service files (`authServices.js`, `eventServices.js`, `userServices.js`, `ticketServices.js`, `questionServices.js`) have been standardized to use the central `httpClient`. Old/redundant files have been removed.

## III. Completed Tasks: Backend Refactoring for Ticket & Question Management (Date: 2025-05-17)

Following the frontend API standardization, backend services for event, ticket, and question management were reviewed and refactored for clarity, consistency, and to support more granular control.

**1. Ticket Management (Backend - `Capstone-Backend`):**
    *   **`EventService.updateEvent` Refined:**
        *   The logic for managing the entire ticket collection (delete unsold, then add new from payload) within `EventService.updateEvent` (called by `PUT /events/:id`) was **commented out/removed**.
        *   **Rationale:** To enforce that all ticket modifications (add, update specific, delete specific) after initial event creation occur exclusively through the dedicated `ticketRoutes.ts` endpoints (`/events/:eventId/tickets/*`). This makes the `PUT /events/:id` endpoint's behavior for tickets clearer (i.e., it primarily focuses on core event properties).
    *   **Dedicated Ticket API Endorsed:** The existing dedicated `ticketRoutes.ts`, `TicketController.ts`, and `TicketService.ts` are confirmed as the correct approach for granular ticket management.

**2. Question Management (Backend - `Capstone-Backend`):**
    *   **`EventService.createEvent` Aligned:**
        *   Modified to first attempt to find an existing global `Question` by its `questionText` before creating a new one, aligning its behavior with the more robust logic previously in `EventService.updateEvent`.
    *   **Dedicated API Endpoints for Granular Question Management Implemented:**
        *   **DTOs Created:** `src/types/questionTypes.ts` (e.g., `AddEventQuestionLinkDTO`, `UpdateEventQuestionLinkDTO`).
        *   **New Service:** `src/services/eventQuestionService.ts` created with methods for CRUD operations on event-question links, including organizer verification and safeguards (e.g., preventing deletion of questions with responses).
        *   **New Controller:** `src/controllers/eventQuestionController.ts` created to handle HTTP requests for these operations.
        *   **New Routes:** `src/routes/eventQuestionRoutes.ts` created and mounted under `/api/events/:eventId/questions` (via `src/routes/eventRoutes.ts`). Endpoints include:
            *   `GET /`: List questions for an event.
            *   `POST /`: Add/link a question to an event.
            *   `PUT /:eventQuestionId`: Update an event-question link.
            *   `DELETE /:eventQuestionId`: Delete an event-question link.
    *   **`EventService.updateEvent` Refined for Questions:**
        *   The complex question synchronization logic was **removed** from `EventService.updateEvent`. This method now focuses on core event property updates. Management of event questions post-creation is now handled by the new dedicated endpoints.

## IV. Next Steps for Integration

With foundational backend and frontend API layers standardized, focus shifts to leveraging these improvements.

**A. Frontend (`Capstone-Frontend`):**

1.  **Update `src/api/questionServices.js`:**
    *   Ensure functions in `questionServices.js` correctly map to the new dedicated backend endpoints for granular question management:
        *   `fetchEventQuestions(eventId)` (for `GET /events/:eventId/questions`)
        *   `addQuestionToEvent(eventId, questionData)` (for `POST /events/:eventId/questions`)
        *   `updateEventQuestionLink(eventId, eventQuestionId, linkData)` (for `PUT /events/:eventId/questions/:eventQuestionId`)
        *   `deleteEventQuestionLink(eventId, eventQuestionId)` (for `DELETE /events/:eventId/questions/:eventQuestionId`)
        *   (Optional) `fetchAllGlobalQuestions()` if a UI for picking from a global bank is desired (requires a backend `GET /questions` endpoint, which is a future enhancement).

2.  **Implement/Refactor UI for Ticket and Question Management:**
    *   **Ticket Management UI:** Develop or update the UI (e.g., a "Tickets" tab within an event's admin/edit view) to use the functions from `src/api/ticketServices.js` for listing, adding, editing, and deleting ticket types.
    *   **Question Management UI:** Develop or update the UI (e.g., a "Questions" tab within an event's admin/edit view) to use the functions from `src/api/questionServices.js` for granular management of questions linked to an event.

3.  **Review and Refactor Components Using Event/User Services:**
    *   Audit components that use `eventServices.js` and `userServices.js` to ensure they correctly handle the data structures returned by the refactored services and `httpClient`.
    *   Implement proper loading states and error display.

4.  **Verify Token Refresh and Session Management:**
    *   Thoroughly test login, logout, and scenarios where the access token might expire across different API calls to ensure the refresh mechanism in `httpClient` works as expected.

5.  **Implement Role-Based Access Control (RBAC) More Granularly in UI:**
    *   While basic route protection is in place, extend RBAC to conditionally render UI elements (buttons, sections, menu items) based on `userStore.currentUser.role`.

6.  **Global Error Handling/Notifications:**
    *   Consider implementing a global UI notification system (e.g., toasts) that can be triggered by the `httpClient` response interceptor or by components for API errors.

**B. Backend (`Capstone-Backend`):**

1.  **Add Joi Validation for New Question DTOs:**
    *   **Status: COMPLETED (2025-05-17).** Joi validation schemas were created in `src/validation/eventQuestionValidation.ts` for `AddEventQuestionLinkDTO` and `UpdateEventQuestionLinkDTO`. These schemas were applied as middleware in `src/routes/eventQuestionRoutes.ts`.
2.  **Global Question Bank Management (Optional Future Enhancement):**
    *   If desired, implement API endpoints (`GET /questions`, `POST /questions`, etc.) and associated services/controllers for managing the global `Question` table directly.
3.  **Review `EventService.createEvent` for Ticket/Question Creation:**
    *   Consider if `EventService.createEvent` should internally call the new `EventQuestionService.addQuestionToEvent` (and potentially `TicketService.createTicket`) for creating initial questions/tickets, to further centralize that specific logic. For now, its current transactional approach is acceptable.

This summary should provide a good overview of our progress and a roadmap for continuing the integration and refactoring efforts.
