<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { getUserById } from "@/api/users";

const route = useRoute();
const router = useRouter();

const userId = route.params.userId;
var user = ref(null);

var loading = false;

onMounted(async () => {
  const loadingContainer = document.getElementById("loading-container");
  const contentContainer = document.getElementById("content-container");

  // Show the loading animation
  loadingContainer.style.display = "flex";
  contentContainer.style.display = "none";

  // Fetch user profile by ID
  user.value = await getUserById(userId);
  loading = true;

  if (user) {
    loadingContainer.style.display = "none";
    contentContainer.style.display = "block";
  }
});

const getRoleText = (role) => {
  switch (role) {
    case "ADMIN":
      return "ADMIN";
    case "ORGANIZER":
      return "ORGANIZER";
    case "PARTICIPANT":
      return "PARTICIPANT";
    default:
      return "role";
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const goBack = () => {
  router.push("/admin/users");
};
</script>

<script>

export default {
  
}

</script>

<template>
  <AdminLayout>
    <div class="p-4" id="content-container">
      <div class="mb-4 d-flex align-items-center">
        <button
          @click="goBack"
          class="btn btn-outline-secondary me-2"
          title="Back"
        >
          <i class="pi pi-arrow-left me-1"></i>
          Back
        </button>
        <h1 class="display-6 mb-0">User Details</h1>
      </div>
      <div v-if="user" class="bg-white rounded shadow-sm p-4 text-start">
        <div class="mb-3">
          <strong>Name:</strong> {{ user.firstName }} {{ user.lastName }}
        </div>
        <div class="mb-3"><strong>Email:</strong> {{ user.email }}</div>
        <div class="mb-3"><strong>Phone:</strong> {{ user.phoneNo }}</div>
        <div class="mb-3">
          <strong>Role:</strong> {{ getRoleText(user.role) }}
        </div>
        <div class="mb-3">
          <strong>Registration Date:</strong> {{ formatDate(user.createdAt) }}
        </div>
      </div>
    </div>
    <div id="loading-container">
      <div class="loader"></div>
    </div>
  </AdminLayout>
</template>

<style>
#loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Make it fill the whole viewport */
}

.loader {
  border: 10px solid #ddd; /* Light grey border */
  border-top: 10px solid #3498db; /* Blue top border */
  border-radius: 50%;
  width: 80px;
  height: 80px;
  animation: spin 2s linear infinite; /* Spin animation */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

#content-container {
  display: none; /* Initially hide the content */
  text-align: center;
  padding: 20px;
}
</style>
