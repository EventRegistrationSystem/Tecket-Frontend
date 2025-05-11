<!-- src/components/Navbar.vue -->
<template>
  <nav class="navbar --bs-warning-bg-subtle">
    <div class="container-fluid">
      <!-- 品牌 LOGO -->
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

      <!-- 未登录 状态 -->
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

      <!-- 已登录 状态 -->
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

        <!-- 用户头像及下拉 -->
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

        <!-- 下拉菜单 -->
        <div
          v-if="isUserMenuOpen"
          class="position-absolute end-0 bg-dark shadow-lg rounded py-2"
          style="top: 3rem; width: 12rem; z-index: 10"
        >
          <a @click="goToProfile" class="d-flex align-items-center px-4 py-2 text-white text-decoration-none">
            <i class="pi pi-user me-2"></i> Profile
          </a>
          <div class="border-top border-secondary my-1"></div>
          <a @click="logOut" class="d-flex align-items-center px-4 py-2 text-white text-decoration-none">
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
import { fetchUserProfile } from '@/api/users.js';

const router = useRouter();
const userStore = useUserStore();

// 登录状态
const isAuthenticated = computed(() => userStore.isAuthenticated);

// 当前用户信息
const userData = ref(null);

// 下拉菜单开关
const isUserMenuOpen = ref(false);
function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value;
}

// 组件挂载后，如果已登录则拉取用户信息
onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      const data = await fetchUserProfile();
      userData.value = data;
    } catch (err) {
      console.error('获取用户信息失败：', err);
    }
  }
});

// 导航到个人页或管理后台
function goToProfile() {
  if (!userData.value) return;
  if (userData.value.role === 'ADMIN') {
    router.push('/admin');
  } else {
    router.push('/user/profile');
  }
}

// 退出登录，清除 store 并跳转登录
function logOut() {
  userStore.clearAccessToken();
  userStore.clearCurrentUser();
  userStore.clearRefreshToken?.();
  router.push('/signIn');
}
</script>

<style scoped>
#brandName {
  font-family: 'LogoFont';
}
</style>
