<template>
  <nav class="navbar --bs-warning-bg-subtle">
    <div class="container-fluid">
      <a class="navbar-brand" href="/">
        <img
          src="../assets/logo.png"
          alt="Logo"
          width="55"
          height="55"
          class="d-inline-block align-text-middle"
          style="stroke: black"
        />
        <span class="text-dark fw-bold" id="brandName">Teket</span>
      </a>

      <!-- User has not sign in -->
      <ul v-if="navState == true" class="nav justify-content-end">
        <li class="nav-item">
          <a href="/events" style="font-family: 'Font'" class="nav-link">
            <img
              src="../assets/calendar.png"
              alt="ICON"
              class="d-inline-block align-text-middle"
              width="20"
              height="20"
            />
            <span class="text-warning ms-2 fw-semibold">Events</span>
          </a>
        </li>
        <li class="nav-item ms-4">
          <router-link to="/signIn">
            <button class="btn btn-warning fw-semibold">Sign In</button>
          </router-link>
        </li>
        <li class="nav-item ms-3">
          <router-link to="/signUp"
            ><button class="btn btn-light fw-semibold">
              Sign Up
            </button></router-link
          >
        </li>
      </ul>

      <!-- If already logged in -->
      <ul v-else class="nav justify-content-end">
        <li class="nav-item">
          <a href="/events" style="font-family: 'Font'" class="nav-link">
            <img
              src="../assets/calendar.png"
              alt="ICON"
              class="d-inline-block align-text-middle"
              width="20"
              height="20"
            />
            <span class="text-warning ms-2 fw-semibold">Events</span>
          </a>
        </li>
        <div
          class="d-flex align-items-center"
          style="cursor: pointer"
          @click="toggleUserMenu"
        >
          <img
            src="https://i.pravatar.cc/36"
            alt="User"
            class="rounded-circle me-2"
            style="width: 2rem; height: 2rem"
          />
          <span class="text-dark d-none d-md-inline"
            >{{ userData.firstName }} {{ userData.lastName }}</span
          >
          <i class="pi pi-angle-down ms-2 fs-6"></i>

          <!-- User dropdown menu (shown when isUserMenuOpen is true) -->
          <div
            v-if="isUserMenuOpen"
            class="position-absolute end-0 bg-dark shadow-lg rounded py-2"
            style="top: 3rem; width: 12rem; z-index: 10"
          >
            <a
              v-on:click="checkRole()"
              class="d-flex align-items-center px-4 py-2 text-white text-decoration-none user-menu-item"
            >
              <i class="pi pi-user me-2"></i> Profile
            </a>
            <div class="border-top border-secondary my-1"></div>
            <a
              v-on:click="logOut()"
              class="d-flex align-items-center px-4 py-2 text-white text-decoration-none user-menu-item"
            >
              <i class="pi pi-power-off me-2"></i> Logout
            </a>
          </div>
        </div>
      </ul>
    </div>
  </nav>
</template>

<script>
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import { fetchUserProfile } from "@/api/users.js";
import { onMounted } from "vue";
import { ref } from "vue";
import router from "@/router";

export default {
  data() {
    return {
      navState: true,
      userData: ref(null),
    };
  },

  mounted() {
    this.checkState();

    if (this.navState == false) {
      console.log("Run Check");
      fetchUserProfile()
        .then((data) => {
          this.userData = data;
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  },

  methods: {
    checkState() {
      const userStore = useUserStore();
      if (userStore.isAuthenticated) {
        console.log("User state verified");

        // Change state of Navbar
        this.navState = false;
      } else {
        console.log("User state NOT verified");
      }
    },

    checkRole() {
      if ((this.userData.role == "ADMIN")) {
        router.push("/admin");
      } else if ((this.userData.role == "PARTICIPANT")) {
        router.push("/user/profile");
      } else {
      }
    },

    logOut() {
      const userStore = useUserStore();
      userStore.clearAccessToken();
      userStore.clearRole();

      // Action NEEDED for refreshToken

      window.location.reload();

    }
  },
};
</script>

<script setup>
import { ref } from "vue";

const isUserMenuOpen = ref(false);

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

defineEmits(["toggle-sidebar"]);
</script>

<style scoped>
#brandName {
  font-family: "LogoFont";
}
</style>
