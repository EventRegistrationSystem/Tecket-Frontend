<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminLayout from '@/views/admin/AdminLayout.vue'
import { fetchUserById, updateUser } from "@/api/userServices";

// Get route and router instances
const route = useRoute();
const router = useRouter();

const userId = route.params.userId;

// Define reactive objects for storing the found user and form data
const user = ref(null);
const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  phoneNo: "",
  role: "",
});
const error = ref(null);

// Fetch the corresponding user after the page loads and initialize the form data
onMounted(async () => {
  user.value = await fetchUserById(userId);
  if (user.value) {
    // Copy the found user data to the form
    form.value = {
      firstName: user.value.firstName,
      lastName: user.value.lastName,
      email: user.value.email,
      phoneNo: user.value.phoneNo,
      role: user.value.role,
    };
  }
  console.log("DONE Fetching User Data");
});

const updateUserData = async () => {
  error.value = null;
  const userData = {
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    email: form.value.email,
    phoneNo: form.value.phoneNo,
    role: form.value.role,
  };

  try {
    await updateUser(userId, userData);
    router.push(`/admin/users/${userId}`);
  } catch (err) {
    error.value = err.message || 'An error occurred while updating the user.';
  }
};

// Cancel editing and return to the user list
const cancelEdit = () => {
  router.push("/admin/users");
};
</script>

<template>
  <AdminLayout>
    <div class="container py-4">
      <!-- Page header with back button -->
      <div class="d-flex align-items-center mb-4">
        <button
          @click="cancelEdit"
          class="btn btn-outline-secondary me-2"
          title="Back"
        >
          <i class="pi pi-arrow-left me-1"></i>
          Back
        </button>
        <h1 class="display-6 mb-0">Edit User</h1>
      </div>

      <!-- User edit form -->
      <div v-if="user" class="card shadow-sm">
        <div class="card-body">
          <form @submit.prevent="updateUserData">
            <!-- Name -->
            <div class="mb-3 row">
              <div class="col-md-6">
                <label for="first_name" class="form-label">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  v-model="form.firstName"
                  class="form-control"
                />
              </div>
              <div class="col-md-6">
                <label for="last_name" class="form-label">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  v-model="form.lastName"
                  class="form-control"
                />
              </div>
            </div>
            <!-- Email -->
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input
                type="email"
                id="email"
                v-model="form.email"
                class="form-control"
              />
            </div>
            <!-- Phone -->
            <div class="mb-3">
              <label for="phone_no" class="form-label">Phone</label>
              <input
                type="text"
                id="phone_no"
                v-model="form.phoneNo"
                class="form-control"
              />
            </div>
            <!-- Role selection -->
            <div class="mb-3">
              <label for="role" class="form-label">Role</label>
              <select id="role" v-model="form.role" class="form-select">
                <option value="ADMIN">ADMIN</option>
                <option value="ORGANIZER">ORGANIZER</option>
                <option value="PARTICIPANT">PARTICIPANT</option>
              </select>
            </div>
            <!-- Error Display -->
            <div v-if="error" class="alert alert-danger mt-3" role="alert">
              {{ error }}
            </div>
            <!-- Button area -->
            <div class="d-flex justify-content-end">
              <button
                type="button"
                @click="cancelEdit"
                class="btn btn-secondary me-2"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Show a message if the user is not found -->
      <div v-else class="alert alert-danger" role="alert">User not found.</div>
    </div>
  </AdminLayout>
</template>

<style scoped>
@media (max-width: 576px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .row .col-md-6 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>
