const userProfileRoutes = [
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

export default userProfileRoutes;
