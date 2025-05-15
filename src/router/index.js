import { createRouter, createWebHistory } from "vue-router";

import HomeView from "@/views/HomeView.vue";
import UserManagementView from "@/views/user/userManagementView.vue";
import userEventView from "@/views/user/userEventView.vue";
import Events from "@/views/event/EventListView.vue";
import SignIn from "@/views/auth/SignInView.vue";
import SignUp from "@/views/auth/SignUpView.vue";

import TicketSelection from "@/views/registration/TicketSelectionFormView.vue";
import Questionnaire from "@/views/registration/QuestionnaireFormView.vue";
import Review from "@/views/registration/ReviewFormView.vue";
import Checkout from "@/views/registration/CheckoutView.vue";
import UserProfileView from "@/views/user/UserProfileView.vue";
const routes = [
  { path: "/", component: HomeView },

  // Authentication views
  { path: "/events", component: Events },
  { path: "/signIn", component: SignIn },
  { path: "/signUp", component: SignUp },
  
  // Public event routes
  {
    path: "/eventDetail/:id",
    name: "EventDetail",
    component: () => import("@/views/event/EventDetailsView.vue"),
  },

  // Registraiton routes
  {
    path: "/ticket-selection",
    name: "TicketSelection",
    component: TicketSelection,
  },
  {
    path: "/personalInfo",
    name: "PersonalInfo",
    component: () => import("@/views/registration/PersonalInfoFormView.vue"),
  },
  {
    path: "/complete-form/questionnaire",
    name: "Questionnaire",
    component: Questionnaire,
  },
  {
    path: "/complete-form/review",
    name: "Review",
    component: Review,
  },
  {
    path: "/checkout",
    name: "Checkout",
    component: Checkout,
  },

  // Admin routes

  // -- Dashboard --
  {
    path: "/admin",
    name: "dashboard",
    component: () => import("../views/admin/DashboardView.vue"),
  },

  // -- Event Management --
  {
    path: "/admin/events",
    name: "events",
    component: () => import("../views/admin/Event/EventsListView.vue"),
  },
  {
    path: "/admin/events/create",
    name: "event-create",
    component: () => import("../views/admin/Event/EventFormView.vue"),
  },
  {
    path: "/admin/events/:id",
    name: "event-details",
    component: () => import("../views/admin/Event/EventDetailsView.vue"),
  },
  {
    path: "/admin/events/edit/:id",
    name: "event-edit",
    component: () => import("../views/admin/Event/EventFormView.vue"),
  },

  // -- User Management Routes--
  {
    path: "/admin/users",
    name: "users",
    component: () => import("../views/admin/User/UserList.vue"),
  },
  {
    path: "/admin/users/create",
    name: "UserCreate",
    component: () => import("@/views/admin/User/UserCreate.vue"),
  },
  {
    path: "/admin/users/:userId",
    name: "UserDetails",
    component: () => import("@/views/admin/User/UserDetail.vue"),
  },
  {
    path: "/admin/users/edit/:userId",
    name: "UserEdit",
    component: () => import("@/views/admin/User/UserEdit.vue"),
  },

  // -- Ticket Management Routes -- (Consider removing)
  {
    path: "/admin/tickets",
    name: "TicketsView",
    component: () => import("@/views/admin/Tickets/TicketsList.vue"),
  },
  {
    path: "/admin/tickets/:eventId",
    name: "TicketsManagement",
    component: () => import("@/views/admin/Tickets/TicketsManagement.vue"),
  },
  {
    path: "/admin/tickets/users/:id",
    name: "TicketUserDetail",
    component: () => import("@/views/admin/Tickets/TicketUserDetail.vue"),
  },
  {
    path: "/admin/tickets/participants/:id",
    name: "ParticipantsDetail",
    component: () =>
      import("@/views/admin/Tickets/TicketsParticipantsDetail.vue"),
  },
  {
    path: "/admin/events/:eventId/tickets/create",
    name: "TicketTypeCreate",
    component: () => import("@/views/admin/Tickets/TicketTypeCreate.vue"),
  },
  {
    path: "/admin/tickets/:eventId/edit/:ticketId",
    name: "TicketEdit",
    component: () => import("@/views/admin/Tickets/TicketTypeEdit.vue"),
  },

  // -- Questionnaire Management Routes -- (Consider removing)
  {
    path: "/admin/Questionnaire",
    name: "QuestionnaireList",
    component: () =>
      import("@/views/admin/Questionnaire/QuestionnaireList.vue"),
  },
  {
    path: "/admin/questionnaire/view/:eventId",
    name: "ViewQuestionnaire",
    component: () =>
      import("@/views/admin/Questionnaire/ViewQuestionnaire.vue"),
  },

  // -- User Management Routes --
  { path: "/user/profile", component: UserProfileView },

  {
    path: "/user/management",
    name: "userManagement",
    component: UserManagementView,
  },

  {
    path: "/user/events",
    name: "userEvents",
    component: userEventView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
