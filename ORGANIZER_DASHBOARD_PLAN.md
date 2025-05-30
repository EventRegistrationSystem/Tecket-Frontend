# Plan: Organizer Dashboard (Minimal Effort)

This document outlines the plan to create an Organizer Dashboard with the least amount of work by leveraging existing Admin functionalities.

## Core Strategy
The primary approach is to reuse the existing Admin views and layouts, making minimal changes to adapt them for users with the `ORGANIZER` role. The backend is expected to handle data scoping based on the user's role and ownership.

## Key Assumptions
1.  **Backend Data Scoping:** The backend API (especially `EventService` and related endpoints) correctly filters data for `ORGANIZER` roles, showing only events and related information (like registrations) that they own.
2.  **Router Configuration:** The frontend router (`src/router/index.js`) already has `beforeEach` guards that correctly handle authentication and role-based authorization for routes under `/admin`, granting access to `ORGANIZER`s where specified in route meta.

## Detailed Plan

### 1. Modify `AdminSidebar.vue` (`src/components/admin/AdminSidebar.vue`)
This is the **only file requiring code changes**.

*   **Objective:** Make the sidebar navigation items role-aware.
*   **Changes:**
    *   Import `useUserStore` from `@/store/userStore`.
    *   In the `setup` function, obtain an instance of the `userStore`.
    *   Convert the `menuItems` array into a `computed` property.
    *   Inside this computed property, determine the menu items based on `userStore.currentUser.role`:
        *   **If `userStore.currentUser.role === 'ADMIN'`:**
            Return the existing full list of admin menu items:
            *   Dashboard (id: "dashboard", label: "Dashboard", icon: "pi pi-home", route: "/admin")
            *   Events (id: "events", label: "Events", icon: "pi pi-calendar", route: "/admin/events")
            *   Users (id: "users", label: "Users", icon: "pi pi-users", route: "/admin/users")
            *   Registrations (id: "system-registrations", label: "Registrations", icon: "pi pi-list", route: "/admin/registrations")
        *   **If `userStore.currentUser.role === 'ORGANIZER'`:**
            Return a filtered and adjusted list of menu items:
            *   My Events (id: "my-events", label: "My Events", icon: "pi pi-calendar", route: "/admin/events")
                *   *Note: This replaces the "Dashboard" link for organizers and directs them straight to their event list. The `id` should be distinct if "dashboard" or "events" are used for admins to ensure correct active item highlighting.*
            *   (The "Users" and system-wide "Registrations" links are excluded as they are admin-specific functionalities).

### 2. No Changes Required for Other Files:
The following components and views are expected to work as-is for the organizer dashboard due to the backend data scoping and existing frontend router configurations:

*   **Layouts & Common Admin Components:**
    *   `src/views/admin/AdminLayout.vue`
    *   `src/components/admin/AdminNavbar.vue`
    *   `src/components/admin/AdminFooter.vue`
*   **Router:**
    *   `src/router/index.js`: Existing routes under `/admin` (e.g., `/admin/events`, `/admin/events/:id`, `/admin/events/:eventId/registrations`) already include `ORGANIZER` in their `meta.roles` where appropriate. The navigation guard will handle access.
*   **Admin Views (Reused by Organizers):**
    *   `src/views/admin/Event/EventsListView.vue`
    *   `src/views/admin/Event/EventFormView.vue` (for create/edit)
    *   `src/views/admin/Event/EventDetailsView.vue`
    *   `src/views/admin/Registration/EventRegistrationListView.vue` (for viewing registrations for a specific event owned by the organizer)
    *   `src/views/admin/Registration/RegistrationDetailsView.vue`
*   **Admin Dashboard View:**
    *   `src/views/admin/DashboardView.vue`: This view will be bypassed for organizers as their first sidebar link ("My Events") will navigate directly to `/admin/events`.
*   **Main Public Navbar:**
    *   `src/components/Navbar.vue`: The existing "Profile" link in the user dropdown menu (when an organizer is logged in) already directs them to `/admin` via the `goToProfile()` function. This will serve as the entry point to their management area.

## User Flow for Organizer
1.  Organizer logs into the application.
2.  In the main `Navbar.vue`, the organizer clicks their user avatar/name, then clicks "Profile" from the dropdown.
3.  The `goToProfile()` function in `Navbar.vue` routes them to `/admin`.
4.  The `AdminLayout.vue` loads, which includes the (now role-aware) `AdminSidebar.vue`.
5.  `AdminSidebar.vue` displays the organizer-specific menu:
    *   "My Events" (links to `/admin/events`)
6.  Organizer clicks "My Events".
7.  `EventsListView.vue` loads, displaying only events owned by that organizer (due to backend data scoping).
8.  From `EventsListView.vue`, the organizer can:
    *   Create new events.
    *   View/edit their existing events.
    *   Access the list of registrations for each of their events (via the link on each event row).

## Summary of Work
The only development task is to modify `src/components/admin/AdminSidebar.vue` to implement the role-aware computed property for `menuItems`. All other necessary components and routing logic are already in place or will function correctly due to backend data scoping.
