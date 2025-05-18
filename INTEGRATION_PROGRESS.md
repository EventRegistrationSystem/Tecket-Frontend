# Frontend-Backend Integration Progress Summary

This document tracks the progress of standardizing and refactoring the frontend application's communication with the backend API.

## Date: 2025-05-18 (Updated)

## I. Completed Tasks: Frontend API and Authentication Module Refactoring

The primary goal was to standardize how the frontend handles authentication, API calls, user sessions, and routing related to authentication, and to clean up the API service layer.

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

**7. Frontend API Service Files Cleanup:**
    *   **Status: COMPLETED (2025-05-17).**
    *   **Details:**
        *   `src/api/aquestions.js` functionality moved to `src/api/questionServices.js`.
        *   `src/api/atickets.js` functionality moved to `src/api/ticketServices.js`.
        *   `src/api/auser.js` functionality merged into `src/api/userServices.js`.
        *   `src/api/authRefresh.js` functionality superseded by interceptors in `src/api/httpClient.js`.
        *   All primary frontend API service files (`authServices.js`, `eventServices.js`, `userServices.js`, `ticketServices.js`, `questionServices.js`) now use the central `httpClient`.

## II. Completed Tasks: Backend Refactoring for Event, Ticket & Question Management (Date: 2025-05-17)

Backend services were refactored for clarity, consistency, granular control, and robust ADMIN privileges. This involved an initial move to granular endpoints, followed by a strategic reversion for `EventService.updateEvent` to handle monolithic updates by orchestrating calls to specialized services.

**1. Ticket Management (Backend - `Capstone-Backend`):**
    *   **`EventService.updateEvent` Refined (Monolithic Sync Re-implemented via Service Orchestration):**
        *   `EventService.updateEvent` (called by `PUT /api/events/:id`) was refactored to handle monolithic synchronization of the event's entire `tickets` collection.
        *   It achieves this by performing comparison logic and then orchestrating calls to `TicketService` methods (e.g., `deleteTicket`, `createTicket`).
        *   `TicketService` CUD methods were made transaction-aware (accepting an optional Prisma transaction client `tx`) to ensure atomicity.
    *   **Dedicated Ticket API Endorsed:** `ticketRoutes.ts`, `TicketController.ts`, and `TicketService.ts` remain for granular operations and are used by `EventService`.

**2. Question Management (Backend - `Capstone-Backend`):**
    *   **`EventService.createEvent` Aligned:** Modified to find/reuse existing global `Question` records by text.
    *   **Dedicated API Endpoints for Granular Question Management Implemented & Retained:**
        *   DTOs created in `src/types/questionTypes.ts`.
        *   `EventQuestionService.ts`, `EventQuestionController.ts`, and `eventQuestionRoutes.ts` created for granular CRUD operations on event-question links. These remain available.
    *   **`EventService.updateEvent` Refined (Monolithic Sync Re-implemented via Service Orchestration):**
        *   Refactored to handle monolithic synchronization of `EventQuestions` links by orchestrating calls to `EventQuestionService` methods (which were made transaction-aware).
    *   **Joi Validation for New Question DTOs:** Implemented and applied in `eventQuestionRoutes.ts`.

**3. ADMIN Privilege Standardization (Backend - `Capstone-Backend`):**
    *   **Status: COMPLETED (2025-05-17).**
    *   **Details:**
        *   `EventService.ts`, `TicketService.ts`, and `EventQuestionService.ts` CUD methods were updated to accept `userRole` and correctly bypass ownership checks for ADMIN users, often using standardized helper methods (e.g., `verifyAdminOrEventOrganizer`).
        *   Respective controllers (`EventController.ts`, `TicketController.ts`, `EventQuestionController.ts`) were updated to pass `userId` and `userRole` to services.
        *   Route-level `authorize('ORGANIZER', 'ADMIN')` middleware was verified/added for CUD operations.

## III. Current Next Steps for Integration

With foundational backend and frontend API layers standardized and backend event/ticket/question management refactored:

**A. Frontend (`Capstone-Frontend`):**

1.  **Update `src/api/questionServices.js`:**
    *   **Action:** Ensure functions correctly map to the dedicated backend endpoints for granular question management (e.g., `fetchEventQuestions`, `addQuestionToEvent`, `updateEventQuestionLink`, `deleteEventQuestionLink`).
2.  **Implement/Refactor UI for Ticket and Question Management:**
    *   **Ticket Management UI:** Develop/update UI (e.g., "Tickets" tab in event admin) using `src/api/ticketServices.js`.
    *   **Question Management UI:** Develop/update UI (e.g., "Questions" tab in event admin) using the updated `src/api/questionServices.js` for granular management, or ensure it correctly sends full question arrays if relying on monolithic updates via `EventService.updateEvent`.
3.  **Resolve Event Creation Issues (e.g., `isRequired` field error):**
    *   **Action:** Debug the payload sent from `EventFormView.vue` during event creation to ensure it perfectly matches the backend `CreateEventDTO` and Joi `createEventSchema`.
4.  **Review and Refactor Components Using Event/User Services:**
    *   Audit components using `eventServices.js` and `userServices.js`; ensure correct data handling, loading states, and error display.
5.  **Verify Token Refresh and Session Management:**
    *   Thoroughly test login, logout, and token expiration scenarios.
6.  **Implement Granular RBAC in UI:**
    *   Extend role-based conditional rendering of UI elements.
7.  **Global Error Handling/Notifications:**
    *   Consider a global UI notification system for API errors.

**B. Backend (`Capstone-Backend`):**

1.  **Re-enable and Complete Joi Validations:**
    *   **Action:** Re-enable `validateRequest(createEventSchema)` in `eventRoutes.ts` (for `POST /api/events`).
    *   **Action:** Re-enable `validateRequest(addEventQuestionLinkSchema)` in `eventQuestionRoutes.ts` (for `POST /api/events/:eventId/questions`).
    *   **Action:** Create and apply Joi schemas for `updateEvent` (`PUT /api/events/:id`) and `updateEventStatus` (`PATCH /api/events/:id/status`) payloads in `eventRoutes.ts`.
2.  **Review `EventService.createEvent` Internal Calls (Optional Refinement):**
    *   Consider if `EventService.createEvent` should internally call `TicketService.createTicket` and `EventQuestionService.addQuestionToEvent` (passing `tx`) for creating initial tickets/questions, for maximum consistency with the `updateEvent` pattern. (Currently uses direct `tx.ticket.create` etc.).
3.  **Global Question Bank Management (Optional Future Enhancement):**
    *   Implement dedicated API/UI for managing the global `Question` table if needed.

This summary should provide a good overview of our progress and a roadmap for continuing the integration and refactoring efforts.
