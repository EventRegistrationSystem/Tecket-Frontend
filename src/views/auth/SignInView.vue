<template>
  <navbar />
  <div class="h-90" style="background-color: #edece8">
    <div class="container text-center w-100" style="width: 100%">
      <div class="row align-items-center" style="height: 100vh">
        <div class="col-3"></div>
        <form action="" style="width: 50%; border-radius: 20px" class="bg-white col-6 pb-3">
          <img src="../../assets/logo.png" alt="logo" height="80" width="80" />
          <h1 style="font-family: 'Font'" class="text-warning">Log In</h1>
          <div class="mb-3 text-start">
            <label for="exampleInputEmail1" class="form-label" style="font-family: 'Font'">Email address</label>
            <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"
              v-model="email" style="font-family: 'Font'; background-color: #fcfcfa" required />
            <!-- Display email error message below input -->
            <div v-if="errors.email" class="text-danger small mt-1">
              {{ errors.email }}
            </div>
          </div>
          <div class="mb-3 text-start">
            <label for="exampleInputPassword1" class="form-label" style="font-family: 'Font'">Password</label>
            <input type="password" class="form-control" id="exampleInputPassword1" style="background-color: #edece8"
              v-model="pwd" required />
            <!-- Display password error message below input -->
            <div v-if="errors.pwd" class="text-danger small mt-1">
              {{ errors.pwd }}
            </div>
          </div>
          <!-- Display general error message -->
          <div v-if="errors.general" class="alert alert-danger mt-3" role="alert">
            {{ errors.general }}
          </div>
          <button type="submit" class="btn btn-primary mt-3" @click.prevent="signIn" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span v-if="isLoading"> Logging in...</span>
            <span v-else>Submit</span>
          </button>
        </form>
        <div class="col-4"></div>
      </div>
    </div>
  </div>
</template>

<script>
import navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
import router from "@/router";
import { useUserStore } from "@/store/userStore";
import { loginUser } from "@/api/authServices.js";

export default {
  components: {
    navbar,
    Footer,
  },

  data() {
    return {
      email: "",
      pwd: "",
      // Error messages for form validation
      errors: {
        email: null,
        pwd: null,
        general: null,
      },
      isLoading: false, // For loading state
    };
  },

  mounted() {
    this.checkState();
  },

  methods: {
    // Prevent going to SignIn after login already
    checkState() {
      const userStore = useUserStore();
      if (userStore.isAuthenticated) {
        console.log("User state verified, redirecting to home.");
        router.push("/");
      }
    },

    validateForm() {
      this.errors = { email: null, pwd: null, general: null }; // Clear previous errors
      let isValid = true;

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.email || !emailPattern.test(this.email)) {
        this.errors.email = "Please enter a valid email address.";
        isValid = false;
      }
      if (!this.pwd) {
        this.errors.pwd = "Password is required.";
        isValid = false;
      }
      return isValid;
    },

    async signIn() {
      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;
      this.errors.general = null;
      const userStore = useUserStore();

      try {
        const authData = await loginUser(this.email, this.pwd);

        if (authData && authData.user && authData.accessToken) {
          userStore.setAuthData(authData.user, authData.accessToken);

          router.push("/");
        } else {

          // This case should ideally not happen if API guarantees structure on success
          this.errors.general = "Login successful but received unexpected data.";
          console.error("Login response missing user or accessToken:", authData);
        }
      } catch (error) {
        console.error("Login error caught in component:", error);

        if (error && error.message) {
          this.errors.general = error.message;
        }
        else if (typeof error === 'string') {
          this.errors.general = error;
        }
        else {
          this.errors.general = "An unexpected error occurred during login. Please try again.";
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped></style>
