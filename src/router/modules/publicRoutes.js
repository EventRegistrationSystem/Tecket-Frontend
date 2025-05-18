const publicRoutes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomeView.vue")
  },
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
];

export default publicRoutes;
