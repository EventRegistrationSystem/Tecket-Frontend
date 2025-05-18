import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from '@/store/userStore';

// Import route modules
import publicRoutes from './modules/publicRoutes';
import authRoutes from './modules/authRoutes';
import registrationRoutes from './modules/registrationRoutes';
import adminRoutes from './modules/adminRoutes';
import userProfileRoutes from './modules/userProfileRoutes';

const baseRoutes = [
  ...publicRoutes,
  ...authRoutes,
  ...registrationRoutes,
  ...adminRoutes,
  ...userProfileRoutes,
  // TODO: Consider adding a catch-all 404 route here if not handled elsewhere
  // Example: { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFound.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes: baseRoutes, // Use the combined routes
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const isAuthenticated = userStore.isAuthenticated;
  const userRole = userStore.currentUser?.role; 

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiredRoles = to.meta.roles; 

  if (requiresAuth && !isAuthenticated) {
    console.log(`[index-1.js] Navigation Guard: Route ${to.path} requires auth, user not authenticated. Redirecting to SignIn.`);
    next({ name: 'SignIn' });
  } else if (requiresAuth && isAuthenticated && requiredRoles) {
    if (requiredRoles.includes(userRole)) {
      console.log(`[index-1.js] Navigation Guard: User role ${userRole} authorized for ${to.path}.`);
      next(); 
    } else {
      console.log(`[index-1.js] Navigation Guard: User role ${userRole} NOT authorized for ${to.path}. Redirecting to Home.`);
      next({ name: 'Home' }); 
    }
  } else if ((to.name === 'SignIn' || to.name === 'SignUp') && isAuthenticated) {
    console.log(`[index-1.js] Navigation Guard: User authenticated, redirecting from ${to.name} to Home.`);
    next({ name: 'Home' });
  }
  else {
    console.log(`[index-1.js] Navigation Guard: Allowing navigation to ${to.path}.`);
    next();
  }
});

export default router;
