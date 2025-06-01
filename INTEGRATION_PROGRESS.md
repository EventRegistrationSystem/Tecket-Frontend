# Frontend-Backend Integration Progress Summary

This document tracks the progress of standardizing and refactoring the frontend application's communication with the backend API.

## Date: 2025-05-19 (Priorities Updated)

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

## III. Current Next Steps & Revised Priorities (as of 2025-05-19)

Following client feedback and completion of backend Admin User Management, priorities have been adjusted. Payment and Notification features are postponed.

**A. Frontend (`Capstone-Frontend` - High Priority):**

1.  **Registration Management UI (Admin/Organizer):**
    *   **Action:** Design and implement views/components for Admins and Organizers to view, search, and manage registration details. This includes participant information, selected tickets, and questionnaire responses.
    *   **API Integration:** Create/update `src/api/registrationServices.js` to support these new backend endpoints.
2.  **Support New Question Types in UI:**
    *   **Event Setup:** Update `EventFormView.vue` (or dedicated question management UI) to allow organizers to define new question types (e.g., multiple-choice, dropdown) and their options.
    *   **Participant Questionnaire:** Enhance `QuestionnaireFormView.vue` to dynamically render these new question types and correctly capture responses.
    *   **API Integration:** Ensure `src/api/questionServices.js` (and event creation/update payloads) can handle new question type data and options.
3.  **Cleanup Static Data & Full API Integration:**
    *   **Action:** Systematically replace remaining mock data in components with live API calls (e.g., for event lists, user lists for admin management, ticket displays).
    *   Ensure all relevant frontend views are fetching and displaying data from the backend.
4.  **Admin User Management UI Integration:**
    *   **Action:** Implement or complete the frontend UI for Admin User Management, integrating with the completed backend CRUD APIs for users.
5.  **Finalize and Test Core Flows:**
    *   Thoroughly test the end-to-end event creation, event update (monolithic sync), registration, and token refresh flows.
    *   Resolve any outstanding issues like the `isRequired` field error during event creation.

**B. Backend (`Capstone-Backend` - Supporting Frontend & Stability):**

1.  **Registration Management APIs:**
    *   **Action:** Design and implement robust API endpoints for admins/organizers to manage registrations as per frontend requirements.
2.  **Support New Question Types:**
    *   **Action:** Update Prisma schema (`QuestionType` enum, `options` field in `Question` model).
    *   **Action:** Modify `EventQuestionService` and DTOs to handle creation, storage, and retrieval of new question types and their options.
3.  **Re-enable and Complete Joi Validations:**
    *   **Action:** Re-enable `validateRequest(createEventSchema)` (events) and `validateRequest(addEventQuestionLinkSchema)` (event questions).
    *   **Action:** Create and apply Joi schemas for `updateEvent` and `updateEventStatus` payloads.
4.  **Finalize Refresh Token Flow:**
    *   Ensure backend correctly sends 401s for expired tokens to enable frontend refresh (recent fixes should address this).
5.  **Review `EventService.createEvent` Internal Calls (Optional Refinement):**
    *   Consider refactoring to call `TicketService.createTicket` and `EventQuestionService.addQuestionToEvent` (passing `tx`) for consistency.

**C. Postponed / Lower Priority:**

*   Advanced Payment Features (Refunds, etc.) and full PaymentService unit testing.
*   Core Email Notification System.
*   Global Question Bank Management (Backend).
*   Global Error Handling/Notifications (Frontend - beyond basic).
*   Granular RBAC in UI (Frontend - beyond basic route guards).

This revised plan reflects the new focus on core administrative and user experience features.

## IV. Event Registration Flow and Router Refactoring (Date: 2025-05-19)

This phase focused on implementing the core event registration flow (excluding payment processing for now) and significantly refactoring the Vue Router setup for better organization and performance.

**A. Frontend (`Capstone-Frontend`): Event Registration Flow Implementation**

1.  **New API Service for Registration:**
    *   **File Created:** `src/api/registrationServices.js`
    *   **Details:** Includes `createRegistration(registrationData)` function to call the backend `POST /api/registrations` endpoint using the central `httpClient`.
2.  **New Pinia Store for Registration State:**
    *   **File Created:** `src/store/registrationStore.js`
    *   **Details:** Manages the entire state of the multi-step registration process, including:
        *   `eventId` and full `eventDetails` (name, tickets, dynamic event-specific questions).
        *   `selectedTickets` (array of `{ ticketId, name, price, quantity, ... }`).
        *   `participants` (array of participant objects: `{ email, firstName, lastName, ..., responses: [] }`). Each participant's `responses` array is structured to hold `eventQuestionId`, `questionId`, `questionText`, `isRequired`, `questionType`, `validationRules`, and `responseText` for dynamic rendering and submission.
        *   `registrationId` and `paymentToken` (from backend upon submission).
        *   `currentStep` in the registration flow.
    *   Includes actions to set event data, update ticket quantities, initialize/update participant info and responses, reset state, and prepare the payload for API submission.
    *   `initializeParticipants()` action enhanced to correctly structure participant response arrays based on `eventDetails.eventQuestions` and handle free event scenarios.
3.  **Refactored Event Details View for Registration Initiation:**
    *   **File Updated:** `src/views/event/EventDetailsView.vue`
    *   **Details:**
        *   Fetches full event details (including `tickets` and `eventQuestions`) using `eventServices.js`.
        *   On "Register now" click, it calls `registrationStore.setEvent()` to populate the store with the current event's data and navigates to the first step of registration.
        *   Console logs added for debugging `eventQuestions` data.
4.  **Refactored Multi-Step Registration Views:**
    *   **`src/views/registration/TicketSelectionFormView.vue`:**
        *   Dynamically displays available tickets from `registrationStore.eventDetails.tickets`.
        *   Updates `registrationStore` with selected ticket quantities.
        *   Navigates to the personal info step.
    *   **`src/views/registration/PersonalInfoFormView.vue`:**
        *   Dynamically creates forms for each participant based on `registrationStore.totalSelectedTickets` (or 1 for free events).
        *   Collects and stores participant details (email, name, optional fields) in `registrationStore.participants`.
        *   A "Maximum recursive updates" warning was resolved by removing a redundant `watch`er.
    *   **`src/views/registration/QuestionnaireFormView.vue`:**
        *   Dynamically renders questions for each participant based on `registrationStore.eventDetails.eventQuestions`.
        *   Supports 'TEXT' and 'MULTIPLE_CHOICE' (with options) question types.
        *   Includes a fallback to a text input for unrecognized question types or improperly configured MULTIPLE_CHOICE questions.
        *   Binds answers to the `responses` array within each participant object in the `registrationStore`.
    *   **`src/views/registration/ReviewFormView.vue`:**
        *   Displays a comprehensive summary of the event, selected tickets, total cost (calculated), and all participant details including their questionnaire responses, all sourced from `registrationStore`.
        *   Handles submission by calling `registrationServices.createRegistration()` with a payload generated by `registrationStore.getRegistrationPayload()`.
        *   Navigates to `RegistrationSuccessView` (for free events) or `RegistrationPendingPaymentView` (for paid events, as payment is deferred).
        *   Displays API errors if submission fails.
5.  **New Registration Outcome Views:**
    *   **File Created:** `src/views/registration/RegistrationSuccessView.vue` (displays success message and registration ID).
    *   **File Created:** `src/views/registration/RegistrationPendingPaymentView.vue` (displays pending status, registration ID, and payment token if applicable).
6.  **User Experience Enhancement - Cancel Registration:**
    *   **File Updated:** `src/components/StepIndicator.vue`
    *   **Details:** Added a "Cancel Registration" button. Clicking it prompts for confirmation, then calls `registrationStore.resetRegistrationState()` and navigates the user back to the event details page (if `eventId` is known) or the main event list.

**B. Frontend (`Capstone-Frontend`): Router Refactoring**

1.  **Standardized Dynamic Imports:**
    *   **File Updated:** `src/router/index.js` (initially, then this structure was moved to `index-1.js`)
    *   **Details:** All route components were converted to use dynamic imports (`component: () => import('...')`) for lazy loading, improving initial application load time.
2.  **Modularized Router Configuration:**
    *   **New Directory Created:** `src/router/modules/`
    *   **New Route Module Files Created:**
        *   `src/router/modules/publicRoutes.js`
        *   `src/router/modules/authRoutes.js`
        *   `src/router/modules/registrationRoutes.js`
        *   `src/router/modules/adminRoutes.js` (admin view import paths updated to use `@/views/admin/...`)
        *   `src/router/modules/userProfileRoutes.js`
    *   **New Main Router File:**
        *   **File Created:** `src/router/index-1.js`
        *   **Details:** This file now imports all the route modules, concatenates their route arrays, and sets up the `VueRouter` instance, including the existing navigation guard. The original `src/router/index.js` was preserved as a backup.
        *   To activate this new setup, `src/main.js` needs to be updated to import the router from `'./router/index-1'`.

**C. Frontend (`Capstone-Frontend`): Admin Dashboard Adjustments**

1.  **Removed Top-Level "Tickets" Management:**
    *   **File Updated:** `src/components/admin/AdminSidebar.vue` - Removed "Tickets" link.
    *   **File Updated:** `src/router/index.js` (and subsequently `src/router/modules/adminRoutes.js`) - Removed routes for `/admin/tickets`, `/admin/tickets/users/:id`, and `/admin/tickets/participants/:id`.
    *   Associated view files (`TicketsList.vue`, `TicketUserDetail.vue`, `TicketsParticipantsDetail.vue`) were manually deleted. Ticket management remains for event-specific contexts.

**D. Current Next Steps for Frontend (Post-Registration Flow V1 & Router Refactor):**

1.  **Activate Modular Router:** Update `src/main.js` to use `src/router/index-1.js`.
2.  **Thorough Testing of Registration Flow:** Test with various events (paid, free, with/without questions of different types) to ensure data integrity and correct navigation.
3.  **Payment Integration:** Implement Stripe Elements in `CheckoutView.vue` and integrate with backend payment intent creation and webhook confirmation polling/handling.
4.  **Address Remaining Items from Section III.A:**
    *   Update `src/api/questionServices.js` for granular question management (if still needed after dynamic event questions in registration).
    *   Implement/Refactor UI for admin-side Ticket and Question Management (within an event context).
    *   Resolve any remaining Event Creation issues.
    *   Review and Refactor Components Using Event/User Services.
    *   Implement Granular RBAC in UI.
    *   Consider Global Error Handling/Notifications.
