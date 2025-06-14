<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AdminLayout from '@/views/admin/AdminLayout.vue'
import { createUser } from "@/api/userServices";

const router = useRouter();

const firstName = ref('');
const lastName = ref('');
const phoneNo = ref('');
const email = ref('');
const password = ref('');
const role = ref('PARTICIPANT');
const error = ref(null);

const cancelCreate = () => {
  router.push("/admin/users");
};

const createNewUser = async () => {
  error.value = null;
  const userData = {
    firstName: firstName.value,
    lastName: lastName.value,
    phoneNo: phoneNo.value,
    email: email.value,
    password: password.value,
    role: role.value,
  };
  try {
    await createUser(userData);
    router.push("/admin/users");
  } catch (err) {
    error.value = err.message || 'An error occurred while creating the user.';
  }
};
</script>

<template>
  <AdminLayout>
    <div class="container py-4">
      <!-- Page Header -->
      <div class="d-flex align-items-center mb-4">
        <button
          @click="cancelCreate"
          class="btn btn-outline-secondary me-2"
          title="Back"
        >
          <i class="pi pi-arrow-left me-1"></i>
          Back
        </button>
        <h1 class="display-6 mb-0">Create New User</h1>
      </div>

      <!-- User creation form card -->
      <div class="card shadow-sm">
        <div class="card-body">
          <form @submit.prevent="createNewUser">
            <!-- Name input area -->
            <div class="mb-3 row">
              <div class="col-md-6">
                <label for="first_name" class="form-label">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  v-model="firstName"
                  class="form-control"
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div class="col-md-6">
                <label for="last_name" class="form-label">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  v-model="lastName"
                  class="form-control"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
            <!-- Email input area -->
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input
                type="email"
                id="email"
                v-model="email"
                class="form-control"
                placeholder="Enter email"
                required
              />
            </div>
            <!-- Phone input area -->
            <div class="mb-3">
              <label for="phone_no" class="form-label">Phone Number</label>
              <input
                type="text"
                id="phone_no"
                v-model="phoneNo"
                class="form-control"
                placeholder="Enter phone number"
                required
              />
            </div>
            <!-- Role dropdown selection -->
            <div class="mb-3">
              <label for="role" class="form-label">Role</label>
              <select id="role" v-model="role" class="form-select" required>
                <option value="ADMIN">Admin</option>
                <option value="ORGANIZER">Organizer</option>
                <option value="PARTICIPANT">Participant</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input
                type="text"
                id="password"
                v-model="password"
                class="form-control"
                placeholder="Enter password"
                required
              />
            </div>
            <!-- Error Display -->
            <div v-if="error" class="alert alert-danger mt-3" role="alert">
              {{ error }}
            </div>
            <!-- Button area -->
            <div class="d-flex justify-content-end">
              <button
                type="button"
                @click="cancelCreate"
                class="btn btn-secondary me-2"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">Create User</button>
            </div>
          </form>
        </div>
      </div>
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
