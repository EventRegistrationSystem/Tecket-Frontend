<!-- src/components/Navbar.vue -->
<template>
  <nav class="navbar --bs-warning-bg-subtle">
    <div class="container-fluid">

      <router-link to="/" class="navbar-brand d-flex align-items-center">
        <img
          src="@/assets/logo.png"
          alt="Logo"
          width="55"
          height="55"
          class="d-inline-block align-text-middle"
          style="stroke: black"
        />
        <span class="text-dark fw-bold ms-2" id="brandName">Teket</span>
      </router-link>

      <ul v-if="!isAuthenticated" class="nav justify-content-end">
        <li class="nav-item">
          <router-link to="/events" class="nav-link d-flex align-items-center" style="font-family: 'Font'">
            <img
              src="@/assets/calendar.png"
              alt="ICON"
              width="20"
              height="20"
              class="d-inline-block align-text-middle"
            />
            <span class="text-warning ms-2 fw-semibold">Events</span>
          </router-link>
        </li>
        <li class="nav-item ms-4">
          <router-link to="/signIn">
            <button class="btn btn-warning fw-semibold">Sign In</button>
          </router-link>
        </li>
        <li class="nav-item ms-3">
          <router-link to="/signUp">
            <button class="btn btn-light fw-semibold">Sign Up</button>
          </router-link>
        </li>
      </ul>

      <ul v-else class="nav justify-content-end align-items-center position-relative">
        <li class="nav-item">
          <router-link to="/events" class="nav-link d-flex align-items-center" style="font-family: 'Font'">
            <img
              src="@/assets/calendar.png"
              alt="ICON"
              width="20"
              height="20"
              class="d-inline-block align-text-middle"
            />
            <span class="text-warning ms-2 fw-semibold">Events</span>
          </router-link>
        </li>

        <div class="d-flex align-items-center ms-4" style="cursor: pointer" @click="toggleUserMenu">
          <img
            src="https://i.pravatar.cc/36"
            alt="User"
            class="rounded-circle me-2"
            style="width: 2rem; height: 2rem"
          />
          <span class="text-dark d-none d-md-inline">
            {{ userData?.firstName || '' }} {{ userData?.lastName || '' }}
          </span>
          <i class="pi pi-angle-down ms-2 fs-6"></i>
        </div>

        <div
          v-if="isUserMenuOpen"
          class="position-absolute end-0 bg-dark shadow-lg rounded py-2"
          style="top: 3rem; width: 12rem; z-index: 10"
        >
          <a style="cursor: pointer;" @click="goToProfile" class="d-flex align-items-center px-4 py-2 text-white text-decoration-none">
            <i class="pi pi-user me-2"></i> Profile
          </a>
          <div class="border-top border-secondary my-1"></div>
          <a style="cursor: pointer;" @click="logOut" class="d-flex align-items-center px-4 py-2 text-white text-decoration-none">
            <i class="pi pi-power-off me-2"></i> Logout
          </a>
        </div>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { fetchUserProfile } from '@/api/userServices.js';

const router = useRouter();
const userStore = useUserStore();


const isAuthenticated = computed(() => userStore.isAuthenticated);


const userData = ref(null);


const isUserMenuOpen = ref(false);
function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value;
}

// After the component is mounted, pull user information if logged in
onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      const data = await fetchUserProfile();
      userData.value = data;
    } catch (err) {
      console.error('Failed to get user information:', err);
    }
  }
});

// Navigate to your personal page or admin panel
function goToProfile() {
  if (!userData.value) return;
  if (userData.value.role === 'ADMIN') {
    router.push('/admin');
  } else {
    router.push('/user/profile');
  }
}

// Log out, clear store and jump to login
function logOut() {
  userStore.clearAccessToken();
  userStore.clearRole();
  userStore.clearRefreshToken?.();
  router.push('/signIn');
}
</script>

<style scoped>
#brandName {
  font-family: 'LogoFont';
}
</style>
