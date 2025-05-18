<template>
  <navbar />
  <div class="h-90" style="background-color: #edece8">
    <div class="container text-center w-100" style="width: 100%">
      <div class="row align-items-center" style="height: 100vh">
        <div class="col-3"></div>
        <form
          action=""
          style="width: 50%; border-radius: 20px"
          class="bg-white col-6 pb-3"
        >
          <img src="../../assets/logo.png" alt="logo" height="80" width="80" />
          <h1 style="font-family: 'Font'" class="text-warning">
            Create an account
          </h1>
          <div class="mb-3 text-start input-group mt-4">
            <div class="col-6 pe-2">
              <label
                for="exampleInputEmail1"
                class="form-label"
                style="font-family: 'Font'"
                >First name</label
              >
              <input
                type="text"
                class="form-control"
                id="exampleInputEmail1"
                style="font-family: 'Font'; background-color: #fcfcfa"
                v-model="firstName"
                required
              />
              <!-- Display first name error message below input -->
              <div v-if="errors.firstName" class="text-danger small mt-1">
                {{ errors.firstName }}
              </div>
            </div>
            <div class="col-6">
              <label
                for="exampleInputEmail1"
                class="form-label"
                style="font-family: 'Font'"
                >Last name</label
              >
              <input
                type="text"
                class="form-control"
                id="exampleInputEmail1"
                style="font-family: 'Font'; background-color: #fcfcfa"
                v-model="lastName"
                required
              />
              <!-- Display last name error message below input -->
              <div v-if="errors.lastName" class="text-danger small mt-1">
                {{ errors.lastName }}
              </div>
            </div>
          </div>

          <div class="mb-3 text-start">
            <label
              for="exampleInputEmail1"
              class="form-label"
              style="font-family: 'Font'"
              >Phone number</label
            >
            <input
              type="string"
              class="form-control"
              id="exampleInputEmail1"
              style="font-family: 'Font'; background-color: #fcfcfa"
              v-model="phoneNo"
              required
            />
            <!-- Display phone number error message below input -->
            <div v-if="errors.phoneNo" class="text-danger small mt-1">
              {{ errors.phoneNo }}
            </div>
          </div>

          <div class="mb-3 text-start">
            <label
              for="exampleInputEmail1"
              class="form-label"
              style="font-family: 'Font'"
              >Email address</label
            >
            <input
              type="email"
              class="form-control"
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
              style="font-family: 'Font'; background-color: #fcfcfa"
              v-model="email"
              required
            />
            <!-- Display email error message below input -->
            <div v-if="errors.email" class="text-danger small mt-1">
              {{ errors.email }}
            </div>
          </div>
          <div class="mb-3 text-start">
            <label
              for="exampleInputPassword1"
              class="form-label"
              style="font-family: 'Font'"
              >Password</label
            >
            <input
              type="password"
              class="form-control"
              id="exampleInputPassword1"
              style="background-color: #edece8"
              v-model="pwd"
              required
            />
            <!-- Display password error message below input -->
            <div v-if="errors.pwd" class="text-danger small mt-1">
              {{ errors.pwd }}
            </div>
          </div>
          <div class="mb-3 text-start">
            <label
              for="exampleInputPassword1"
              class="form-label"
              style="font-family: 'Font'"
              >Confirm password</label
            >
            <input
              type="password"
              class="form-control"
              id="exampleInputPassword1"
              style="background-color: #edece8"
              v-model="confirmPwd"
              required
            />
            <!-- Display confirm password error message below input -->
            <div v-if="errors.confirmPwd" class="text-danger small mt-1">
              {{ errors.confirmPwd }}
            </div>
          </div>
          <!-- Display general error message -->
          <div v-if="errors.general" class="alert alert-danger mt-3" role="alert">
            {{ errors.general }}
          </div>
          <button 
            type="submit" 
            class="btn btn-primary mt-3" 
            @click.prevent="signUp"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span v-if="isLoading"> Signing Up...</span>
            <span v-else>Sign Up</span>
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
import { registerUser } from "@/api/authServices.js"; // Import the new service

export default {
  components: {
    navbar,
    Footer,
  },

  data() {
    return {
      firstName: "",
      lastName: "",
      phoneNo: "",
      email: "", // Initialize as empty string
      pwd: "",
      confirmPwd: "",
      errors: { // Initialize all possible error keys
        firstName: null,
        lastName: null,
        phoneNo: null,
        email: null,
        pwd: null,
        confirmPwd: null,
        general: null,
      },
      isLoading: false, // For loading state
    };
  },

  mounted() {
    this.checkState();
  },

  methods: {
    // Prevent going to SignUp after login already
    checkState() {
      const userStore = useUserStore();
      if (userStore.isAuthenticated) {
        console.log("User state verified, redirecting to home.");
        router.push("/");
      }
    },

    validateForm() {
      // Clear previous errors
      this.errors = { 
        firstName: null, lastName: null, phoneNo: null, 
        email: null, pwd: null, confirmPwd: null, general: null 
      };
      let isValid = true;

      const namePattern = /^[A-Za-z\s]+$/; // Allow spaces in names
      if (!this.firstName.trim() || !namePattern.test(this.firstName.trim())) {
        this.errors.firstName = "First name is required and can only contain letters and spaces.";
        isValid = false;
      }
      if (!this.lastName.trim() || !namePattern.test(this.lastName.trim())) {
        this.errors.lastName = "Last name is required and can only contain letters and spaces.";
        isValid = false;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.email || !emailPattern.test(this.email)) {
        this.errors.email = "Please enter a valid email address.";
        isValid = false;
      }
      
      // Password length (backend might have its own rules, align if necessary)
      if (!this.pwd || this.pwd.length < 8) { // Example: min 8 characters
        this.errors.pwd = "Password must be at least 8 characters long.";
        isValid = false;
      }
      // Basic password complexity (example)
      // const passwordCharacter = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
      // if (!passwordCharacter.test(this.pwd)) {
      //   this.errors.pwd = (this.errors.pwd ? this.errors.pwd + " " : "") + "Password must include uppercase, lowercase, and a number.";
      //   isValid = false;
      // }

      if (this.confirmPwd !== this.pwd) {
        this.errors.confirmPwd = "Passwords do not match.";
        isValid = false;
      }

      const phonePattern = /^[0-9+()\s-]*$/; // More flexible phone pattern
      if (this.phoneNo.trim() && !phonePattern.test(this.phoneNo.trim())) {
        this.errors.phoneNo = "Please enter a valid phone number.";
        isValid = false;
      }
      // Note: phoneNo is optional on backend, so empty is fine unless you make it required here.

      return isValid;
    },

    async signUp() {
      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;
      this.errors.general = null;
      const userStore = useUserStore();

      const userData = {
        email: this.email.trim(),
        password: this.pwd, // Password is not trimmed
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        phoneNo: this.phoneNo.trim() || undefined, // Send undefined if empty, as it's optional
      };

      try {
        const authData = await registerUser(userData);
        // authData should be { user, accessToken }

        if (authData && authData.user && authData.accessToken) {
          userStore.setAuthData(authData.user, authData.accessToken);
          router.push("/"); // Navigate to home or dashboard
        } else {
          this.errors.general = "Registration successful but received unexpected data.";
          console.error("Registration response missing user or accessToken:", authData);
        }
      } catch (error) {
        console.error("Registration error caught in component:", error);
        if (error && error.message) {
          // If the error message is "Email already registered", show it.
          // Otherwise, a generic message.
          if (error.message.toLowerCase().includes('email already registered')) {
            this.errors.email = error.message; // Or a more user-friendly version
          } else {
            this.errors.general = error.message;
          }
        } else if (typeof error === 'string') {
          this.errors.general = error;
        }
         else {
          this.errors.general = "An unexpected error occurred during registration. Please try again.";
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
  computed: {},
};
</script>

<style scoped>
h.p {
  font-family: "Font";
}
</style>
