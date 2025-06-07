<template>
  <nav class="navbar navbar-custom-bg">
    <div class="container-fluid">

      <!-- Brand Logo -->
      <router-link to="/" class="navbar-brand d-flex align-items-center">
        <img src="@/assets/logo.png" alt="Logo" width="55" height="55" class="d-inline-block align-text-middle"
          style="stroke: black" />
        <span class="text-dark fw-bold ms-2" id="brandName">Teket</span>
      </router-link>

      <!-- Right hand side -->
      <!-- If user is not authenticated -->
      <ul v-if="!isAuthenticated" class="nav justify-content-end">

        <!-- Links to EventListView -->
        <li class="nav-item">
          <router-link to="/events" class="nav-link d-flex align-items-center" style="font-family: 'Font'">
            <img src="@/assets/calendar.png" alt="ICON" width="20" height="20"
              class="d-inline-block align-text-middle" />
            <span class="text-warning ms-2 fw-semibold">Events</span>
          </router-link>
        </li>

        <!-- Sign In Button -->
        <li class="nav-item ms-4">
          <router-link to="/signIn">
            <button class="btn btn-warning fw-semibold">Sign In</button>
          </router-link>
        </li>

        <!-- Sign Up Button -->
        <li class="nav-item ms-3">
          <router-link to="/signUp">
            <button class="btn btn-light fw-semibold">Sign Up</button>
          </router-link>
        </li>
      </ul>

      <!-- If user is authenticated -->
      <ul v-else class="nav justify-content-end align-items-center position-relative">

        <!-- Links to EventListView -->
        <li class="nav-item">
          <router-link to="/events" class="nav-link d-flex align-items-center" style="font-family: 'Font'">
            <img src="@/assets/calendar.png" alt="ICON" width="20" height="20"
              class="d-inline-block align-text-middle" />
            <span class="text-warning ms-2 fw-semibold">Events</span>
          </router-link>
        </li>

        <!-- User Profile -->
        <div class="d-flex align-items-center ms-4" style="cursor: pointer" @click="toggleUserMenu">
          <span class="text-dark d-none d-md-inline">
            {{ currentUser?.firstName || '' }} {{ currentUser?.lastName || '' }}
          </span>
          <i class="pi pi-angle-down ms-2 fs-6"></i>
        </div>

        <!-- User Menu Dropdown -->
        <div v-if="isUserMenuOpen" class="position-absolute end-0 bg-dark shadow-lg rounded py-2"
          style="top: 3rem; width: 12rem; z-index: 10">
          <a style="cursor: pointer;" @click="goToProfile"
            class="d-flex align-items-center px-4 py-2 text-white text-decoration-none">
            <i class="pi pi-user me-2"></i> Dashboard
          </a>
          <div class="border-top border-secondary my-1"></div>
          <a style="cursor: pointer;" @click="logOut"
            class="d-flex align-items-center px-4 py-2 text-white text-decoration-none">
            <i class="pi pi-power-off me-2"></i> Logout
          </a>
        </div>

      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { fetchUserProfile } from '@/api/userServices.js';
import { logoutUser } from '@/api/authServices.js';

const router = useRouter();
const userStore = useUserStore();

const isAuthenticated = computed(() => userStore.isAuthenticated);
const currentUser = computed(() => userStore.currentUser);

const isUserMenuOpen = ref(false);
function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value;
}

// Fetch user profile when component mounts or when authentication status changes to true
// and user data isn't already in the store.
const loadUserProfile = async () => {
  if (isAuthenticated.value && !currentUser.value) { // Only fetch if authenticated and no user data
    try {
      // And that your userStore might be populated by login/register already.
      // However good for cases where the app loads and user is already authenticated (token in localStorage).
      const userProfileData = await fetchUserProfile(); 
      if (userProfileData) {
        userStore.setUser(userProfileData); // Ensure store has a setUser action
      }
    } catch (err) {
      console.error('Failed to fetch user information on mount:', err);
      // Potentially handle token expiry here if fetchUserProfile fails due to 401
      // though httpClient interceptor should handle refresh. If refresh also fails, it redirects.
    }
  }
};

onMounted(loadUserProfile);

// Watch for changes in authentication state to re-fetch profile if user logs in
// without a full page reload, and user data is not yet set.
watch(isAuthenticated, (newAuthStatus) => {
  if (newAuthStatus && !currentUser.value) {
    loadUserProfile();
  }
});


// Navigate to your personal page or admin panel
function goToProfile() {
  if (!currentUser.value) return;

  // If the user is an admin or organizer, redirect to the admin dashboard
  if (currentUser.value.role === 'ADMIN' || currentUser.value.role === 'ORGANIZER') {
    router.push('/admin');
  } else {
    router.push('/user/profile');
  }
  isUserMenuOpen.value = false; // Close the user menu after navigation
}

// Log out, clear store and redirect to login
async function logOut() {
  try {
    await logoutUser();
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    userStore.clearUserSession();
    isUserMenuOpen.value = false;
    router.push('/');
  }
}
</script>

<style scoped>
#brandName {
  font-family: 'LogoFont';
}

.navbar-custom-bg {
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
