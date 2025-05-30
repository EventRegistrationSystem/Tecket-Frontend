import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from '@/store/userStore';

// Static imports for view components will be removed or converted to dynamic imports.

const routes = [
  { path: "/", name: "Home", component: () => import("@/views/HomeView.vue") },

  // Authentication views
  { path: "/signIn", name: "SignIn", component: () => import("@/views/auth/SignInView.vue") },
  { path: "/signUp", name: "SignUp", component: () => import("@/views/auth/SignUpView.vue") },

  // Public event routes
  {
    path: "/events",
    name: "EventList",
    component: () => import("@/views/event/EventListView.vue")
  },
  {
    path: "/eventDetail/:id",
    name: "EventDetail",
    component: () => import("@/views/event/EventDetailsView.vue"),
    // meta: { requiresAuth: true } // Publicly viewable, registration handles auth
  },

  // Registration routes
  // protected or managed by a flow guard to prevent direct access to later steps without completing earlier ones.
  {
    path: "/register/tickets", // linked from EventDetail
    name: "TicketSelection", // Used in EventDetailsView.vue and TicketSelectionFormView.vue
    component: () => import("@/views/registration/TicketSelectionFormView.vue"),
  },
  {
    path: "/register/info",
    name: "PersonalInfo", // Used in TicketSelectionFormView.vue
    component: () => import("@/views/registration/PersonalInfoFormView.vue"),
  },
  {
    path: "/register/questions",
    name: "Questionnaire", // Used in PersonalInfoFormView.vue 
    component: () => import("@/views/registration/QuestionnaireFormView.vue"),
  },
  {
    path: "/register/review",
    name: "ReviewRegistration", // used in QuestionnaireFormView.vue
    component: () => import("@/views/registration/ReviewFormView.vue"),
    // meta: { requiresAuth: false }
  },
  {
    path: "/register/checkout",
    name: "Checkout", // Used in ReviewFormView.vue (conditionally)
    component: () => import("@/views/registration/CheckoutView.vue"),
    // meta: { requiresAuth: false }
  },
  {
    path: "/registration/success",
    name: "RegistrationSuccess",
    component: () => import("@/views/registration/RegistrationSuccessView.vue"),
    // meta: { requiresAuth: false }
  },
  {
    path: "/registration/pending-payment",
    name: "RegistrationPendingPayment",
    component: () => import("@/views/registration/RegistrationPendingPaymentView.vue"),
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

  // -- Registration Management Routes (Admin) --
  {
    path: "/admin/registrations",
    name: "AdminSystemRegistrationList",
    component: () => import("@/views/admin/Registration/SystemRegistrationListView.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: "/admin/registrations/:registrationId",
    name: "AdminRegistrationDetail",
    component: () => import("@/views/admin/Registration/RegistrationDetailsView.vue"),
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
  {
    path: "/admin/events/:eventId/registrations",
    name: "AdminEventRegistrationList",
    component: () => import("@/views/admin/Registration/EventRegistrationListView.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },

  // -- User Profile & Management (Authenticated User) --
  {
    path: "/user/profile",
    name: "UserProfile",
    component: () => import("@/views/user/UserProfileView.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/user/management",
    name: "UserManagement",
    component: () => import("@/views/user/userManagementView.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/user/events",
    name: "UserEvents",
    component: () => import("@/views/user/userEventView.vue"),
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
  const userRole = userStore.currentUser?.role;

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiredRoles = to.meta.roles; // Array of roles (if specified)

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
