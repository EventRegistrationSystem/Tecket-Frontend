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

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { registerUser } from '@/api/authServices.js';
import navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';

const router = useRouter();
const userStore = useUserStore();

const firstName = ref('');
const lastName = ref('');
const phoneNo = ref('');
const email = ref('');
const pwd = ref('');
const confirmPwd = ref('');
const errors = ref({
  firstName: null,
  lastName: null,
  phoneNo: null,
  email: null,
  pwd: null,
  confirmPwd: null,
  general: null,
});
const isLoading = ref(false);

onMounted(() => {
  if (userStore.isAuthenticated) {
    router.push('/');
  }
});

const validateForm = () => {
  errors.value = {
    firstName: null,
    lastName: null,
    phoneNo: null,
    email: null,
    pwd: null,
    confirmPwd: null,
    general: null,
  };
  let isValid = true;

  const namePattern = /^[A-Za-z\s]+$/;
  if (!firstName.value.trim() || !namePattern.test(firstName.value.trim())) {
    errors.value.firstName = 'First name is required and can only contain letters and spaces.';
    isValid = false;
  }
  if (!lastName.value.trim() || !namePattern.test(lastName.value.trim())) {
    errors.value.lastName = 'Last name is required and can only contain letters and spaces.';
    isValid = false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value || !emailPattern.test(email.value)) {
    errors.value.email = 'Please enter a valid email address.';
    isValid = false;
  }

  if (!pwd.value || pwd.value.length < 8) {
    errors.value.pwd = 'Password must be at least 8 characters long.';
    isValid = false;
  } else {
    const passwordCharacter = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordCharacter.test(pwd.value)) {
      errors.value.pwd = 'Password must include uppercase, lowercase, and a number.';
      isValid = false;
    }
  }

  if (confirmPwd.value !== pwd.value) {
    errors.value.confirmPwd = 'Passwords do not match.';
    isValid = false;
  }

  const phonePattern = /^[0-9+()\s-]*$/;
  if (phoneNo.value.trim() && !phonePattern.test(phoneNo.value.trim())) {
    errors.value.phoneNo = 'Please enter a valid phone number.';
    isValid = false;
  }

  return isValid;
};

const signUp = async () => {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;
  errors.value.general = null;

  const userData = {
    email: email.value.trim(),
    password: pwd.value,
    confirmPassword: confirmPwd.value,
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    phoneNo: phoneNo.value.trim() || undefined,
  };

  try {
    const authData = await registerUser(userData);
    if (authData && authData.user && authData.accessToken) {
      userStore.setAuthData(authData.user, authData.accessToken);
      router.push('/');
    } else {
      errors.value.general = 'Registration successful but received unexpected data.';
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.details) {
      // Handle Joi validation errors
      error.response.data.details.forEach(detail => {
        const key = detail.context.key;
        if (errors.value.hasOwnProperty(key)) {
          errors.value[key] = detail.message;
        } else {
          errors.value.general = detail.message;
        }
      });
    } else if (error.response && error.response.data && error.response.data.message) {
        errors.value.general = error.response.data.message;
    }
    else if (error.message) {
      errors.value.general = error.message;
    } else {
      errors.value.general = 'An unexpected error occurred during registration.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
h.p {
  font-family: "Font";
}
</style>
