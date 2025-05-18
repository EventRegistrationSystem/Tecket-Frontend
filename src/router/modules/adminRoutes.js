const adminRoutes = [
  // -- Dashboard --
  {
    path: "/admin",
    name: "AdminDashboard",  
    component: () => import("@/views/admin/DashboardView.vue"), // Adjusted path
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] } 
  },

  // -- Event Management --
  {
    path: "/admin/events",
    name: "AdminEventList",  
    component: () => import("@/views/admin/Event/EventsListView.vue"), // Adjusted path
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },
  {
    path: "/admin/events/create",
    name: "AdminEventCreate",  
    component: () => import("@/views/admin/Event/EventFormView.vue"), // Adjusted path
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },
  {
    path: "/admin/events/:id",
    name: "AdminEventDetails",  
    component: () => import("@/views/admin/Event/EventDetailsView.vue"), // Adjusted path
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },
  {
    path: "/admin/events/edit/:id",
    name: "AdminEventEdit",  
    component: () => import("@/views/admin/Event/EventFormView.vue"), // Adjusted path
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },

  // -- User Management Routes (Admin) --
  {
    path: "/admin/users",
    name: "AdminUserList",  
    component: () => import("@/views/admin/User/UserList.vue"), 
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

  // -- Ticket Management Routes (Admin, Event-Specific) --
  {
    path: "/admin/events/:eventId/tickets", 
    name: "AdminEventTickets", // Renamed from AdminEventTicketsManagement for consistency
    component: () => import("@/views/admin/Tickets/TicketsManagement.vue"), 
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },
  {
    path: "/admin/events/:eventId/tickets/create",
    name: "AdminEventTicketCreate", // Renamed from AdminTicketTypeCreate
    component: () => import("@/views/admin/Tickets/TicketTypeCreate.vue"), 
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },
  {
    path: "/admin/events/:eventId/tickets/edit/:ticketId", 
    name: "AdminEventTicketEdit", // Renamed from AdminTicketTypeEdit
    component: () => import("@/views/admin/Tickets/TicketTypeEdit.vue"), 
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },

  // -- Questionnaire Management Routes (Admin) --
  {
    path: "/admin/questionnaires", 
    name: "AdminQuestionnaireList",  
    component: () => import("@/views/admin/Questionnaire/QuestionnaireList.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },
  {
    path: "/admin/events/:eventId/questionnaire", 
    name: "AdminViewEventQuestionnaire",  
    component: () => import("@/views/admin/Questionnaire/ViewQuestionnaire.vue"),
    meta: { requiresAuth: true, roles: ['ADMIN', 'ORGANIZER'] }
  },
];

export default adminRoutes;
