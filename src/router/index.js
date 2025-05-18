import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from '@/store/userStore'; 

import HomeView from "@/views/HomeView.vue";
import UserManagementView from "@/views/user/userManagementView.vue";
import userEventView from "@/views/user/userEventView.vue";
import EventListView from "@/views/event/EventListView.vue";
import SignIn from "@/views/auth/SignInView.vue";
import SignUp from "@/views/auth/SignUpView.vue";

import TicketSelection from "@/views/registration/TicketSelectionFormView.vue";
import Questionnaire from "@/views/registration/QuestionnaireFormView.vue";
import Review from "@/views/registration/ReviewFormView.vue";
import Checkout from "@/views/registration/CheckoutView.vue";
import UserProfileView from "@/views/user/UserProfileView.vue";
const routes = [
  { path: "/", name: "Home", component: HomeView },

  // Authentication views
  { path: "/signIn", name: "SignIn", component: SignIn },
  { path: "/signUp", name: "SignUp", component: SignUp },
  
  // Public event routes
  { 
    path: "/events",
    name: "EventList", 
    component: EventListView 
  },
  {
    path: "/eventDetail/:id",
    name: "EventDetail",
    component: () => import("@/views/event/EventDetailsView.vue"),
    // meta: { requiresAuth: true } // Publicly viewable, registration handles auth
  },

  // Registration routes
  // Note: These routes should ideally be protected or managed by a flow guard
  // to prevent direct access to later steps without completing earlier ones.
  // This can be handled by checking registrationStore.currentStep or similar.
  {
    path: "/register/tickets", // linked from EventDetail
    name: "TicketSelection", // Used in EventDetailsView.vue and TicketSelectionFormView.vue
    component: TicketSelection,
    // meta: { requiresAuth: false } // Can be initiated by guest or logged-in user
  },
  {
    path: "/register/info", 
    name: "PersonalInfo", // Used in TicketSelectionFormView.vue
    component: () => import("@/views/registration/PersonalInfoFormView.vue"),
    // meta: { requiresAuth: false }
  },
  {
    path: "/register/questions", 
    name: "Questionnaire", // Used in PersonalInfoFormView.vue (presumably)
    component: Questionnaire,
    // meta: { requiresAuth: false }
  },
  {
    path: "/register/review",
    name: "ReviewRegistration", // used in QuestionnaireFormView.vue (presumably)
    component: Review,
    // meta: { requiresAuth: false }
  },
  {
    path: "/register/checkout", 
    name: "Checkout", // Used in ReviewFormView.vue (conditionally)
    component: Checkout,
    // meta: { requiresAuth: false }
  },
  {
    path: "/registration/success",
    name: "RegistrationSuccess",
    component: () => import("@/views/registration/RegistrationSuccessView.vue"), // Placeholder
    // meta: { requiresAuth: false }
  },
  {
    path: "/registration/pending-payment",
    name: "RegistrationPendingPayment",
    component: () => import("@/views/registration/RegistrationPendingPaymentView.vue"), // Placeholder
    // meta: { requiresAuth: false }
  },

  // Admin routes
  // -- Dashboard --
  {
    path: "/admin",
    name: "AdminDashboard",  
    component: () => import("../views/admin/DashboardView.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] } // Example roles
  },

  // -- Event Management --
  {
    path: "/admin/events",
    name: "AdminEventList",  
    component: () => import("../views/admin/Event/EventsListView.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },
  {
    path: "/admin/events/create",
    name: "AdminEventCreate",  
    component: () => import("../views/admin/Event/EventFormView.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },
  {
    path: "/admin/events/:id",
    name: "AdminEventDetails",  
    component: () => import("../views/admin/Event/EventDetailsView.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },
  {
    path: "/admin/events/edit/:id",
    name: "AdminEventEdit",  
    component: () => import("../views/admin/Event/EventFormView.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },

  // -- User Management Routes (Admin) --
  {
    path: "/admin/users",
    name: "AdminUserList",  
    component: () => import("../views/admin/User/UserList.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: "/admin/users/create",
    name: "AdminUserCreate",  
    component: () => import("@/views/admin/User/UserCreate.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: "/admin/users/:userId",
    name: "AdminUserDetails",  
    component: () => import("@/views/admin/User/UserDetail.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: "/admin/users/edit/:userId",
    name: "AdminUserEdit",  
    component: () => import("@/views/admin/User/UserEdit.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },

  // -- Ticket Management Routes (Admin) --
  {
    path: "/admin/tickets", // General view of tickets, might be event-specific
    name: "AdminTicketsView",  
    component: () => import("@/views/admin/Tickets/TicketsList.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },
  {
    path: "/admin/events/:eventId/tickets", // Tickets for a specific event
    name: "AdminEventTicketsManagement",  
    component: () => import("@/views/admin/Tickets/TicketsManagement.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },
  {
    path: "/admin/tickets/users/:id", // This path seems ambiguous, is it user's tickets or ticket's users?
    name: "AdminTicketUserDetail",  
    component: () => import("@/views/admin/Tickets/TicketUserDetail.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },
  {
    path: "/admin/tickets/participants/:id", // Ambiguous, participants of which ticket/event?
    name: "AdminParticipantsDetail",  
    component: () =>
      import("@/views/admin/Tickets/TicketsParticipantsDetail.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },
  {
    path: "/admin/events/:eventId/tickets/create",
    name: "AdminTicketTypeCreate",  
    component: () => import("@/views/admin/Tickets/TicketTypeCreate.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },
  {
    path: "/admin/events/:eventId/tickets/edit/:ticketId", // Corrected path for clarity
    name: "AdminTicketTypeEdit",  
    component: () => import("@/views/admin/Tickets/TicketTypeEdit.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },

  // -- Questionnaire Management Routes (Admin) --
  {
    path: "/admin/questionnaires", // Changed from /admin/Questionnaire
    name: "AdminQuestionnaireList",  
    component: () =>
      import("@/views/admin/Questionnaire/QuestionnaireList.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },
  {
    path: "/admin/events/:eventId/questionnaire", // View questionnaire for a specific event
    name: "AdminViewEventQuestionnaire",  
    component: () =>
      import("@/views/admin/Questionnaire/ViewQuestionnaire.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },

  // -- User Profile & Management (Authenticated User) --
  { 
    path: "/user/profile", 
    name: "UserProfile", 
    component: UserProfileView, 
    meta: { requiresAuth: true } 
  },
  {
    path: "/user/management", // This might be same as profile or for specific user settings
    name: "UserManagement",  
    component: UserManagementView,
    meta: { requiresAuth: true }
  },
  {
    path: "/user/events",
    name: "UserEvents", // Registered events, etc.
    component: userEventView,
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const isAuthenticated = userStore.isAuthenticated;
  const userRole = userStore.currentUser?.role; // Assumes user object in store has role

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiredRoles = to.meta.roles; // Array of roles if specified

  if (requiresAuth && !isAuthenticated) {
    // If route requires auth and user is not authenticated, redirect to login
    console.log(`Navigation Guard: Route ${to.path} requires auth, user not authenticated. Redirecting to SignIn.`);
    next({ name: 'SignIn' });
  } else if (requiresAuth && isAuthenticated && requiredRoles) {
    // If route requires auth, user is authenticated, and specific roles are required
    if (requiredRoles.includes(userRole)) {
      console.log(`Navigation Guard: User role ${userRole} authorized for ${to.path}.`);
      next(); // User has one of the required roles
    } else {
      console.log(`Navigation Guard: User role ${userRole} NOT authorized for ${to.path}. Redirecting to Home.`);
      next({ name: 'Home' }); // Or a 'Forbidden' page
    }
  } else if ((to.name === 'SignIn' || to.name === 'SignUp') && isAuthenticated) {
    // If user is authenticated and tries to access SignIn or SignUp, redirect to home
    console.log(`Navigation Guard: User authenticated, redirecting from ${to.name} to Home.`);
    next({ name: 'Home' });
  }
  else {
    // Otherwise, allow navigation
    console.log(`Navigation Guard: Allowing navigation to ${to.path}.`);
    next();
  }
});

export default router;
