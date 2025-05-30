<script setup>
import { ref, computed } from "vue";
import { useUserStore } from "@/store/userStore";
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();
const currentUser = computed(() => userStore.currentUser);

const isUserMenuOpen = ref(false);

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const logOut = async () => {
  try {
    await logoutUser();
  } catch (error) {
    console.error('Logout API call failed (AdminNavbar):', error);
  } finally {
    userStore.clearUserSession();
    isUserMenuOpen.value = false;
    router.push("/");
  }
};

defineEmits(["toggle-sidebar"]);
</script>

<template>
  <div class="bg-white shadow-sm d-flex align-items-center justify-content-between px-4" style="height: 4rem">
    <!-- Left section -->
    <div class="d-flex align-items-center">
      <button @click="$emit('toggle-sidebar')" class="me-3 p-2 rounded-circle border-0 no-border-btn">
        <i class="pi pi-bars text-secondary"></i>
      </button>
    </div>

    <!-- Right section -->
    <div class="d-flex align-items-center gap-3">
      <!-- User profile -->
      <div class="d-flex align-items-center" style="cursor: pointer" @click="toggleUserMenu">
        <span class="text-dark d-none d-md-inline">
          {{ currentUser?.firstName || 'User' }} {{ currentUser?.lastName || '' }}
        </span>
        <i class="pi pi-angle-down ms-2 fs-6"></i>

        <!-- Dropdown menu -->
        <div v-if="isUserMenuOpen" class="position-absolute end-0 bg-white border shadow-lg rounded py-2 mt-1"
          style="top: 3rem; width: 12rem; z-index: 1050;">
          <a @click="logOut" class="d-flex align-items-center px-3 py-2 text-dark text-decoration-none user-menu-item"
            style="cursor: pointer;">
            <i class="pi pi-power-off me-2"></i> Logout
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-border-btn {
  background-color: white;
}

.no-border-btn:hover {
  background-color: #e9ecef;
}

.user-menu-item:hover {
  background-color: #f8f9fa;
  /* Lighter hover for light dropdown */
  transition: background-color 0.2s;
}
</style>
