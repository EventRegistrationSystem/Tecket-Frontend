<!-- src/views/admin/Tickets/TicketUserDetail.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { usersMockData } from '@/mock/usersMock.js'

// Get the route parameter id and convert it into the number 11
const route = useRoute()
const router = useRouter()
const userId = parseInt(route.params.id)

// Define user details data and loading status
const userDetail = ref(null)
const loading = ref(true)

// After the page is loaded, find the corresponding user data from usersMockData
onMounted(() => {
  // Here we simply search for users whose id matches userId in usersMockData
  const foundUser = usersMockData.find(user => user.id === userId)
  if(foundUser) {
    // Example transformation: combine first_name and last_name for display and add some hypothetical fields
    userDetail.value = {
      id: foundUser.id,
      name: `${foundUser.first_name} ${foundUser.last_name}`,
      email: foundUser.email,
      ticketType: 'VIP', // Sample data, can be modified according to actual situation
      purchaseDate: foundUser.created_at || '2025-01-10T10:00:00Z',
      phone_no: foundUser.phone_no || 'N/A'
    }
  } else {
    userDetail.value = {
      id: userId,
      name: 'User not found',
      email: '',
      ticketType: '',
      purchaseDate: ''
    }
  }
  loading.value = false
})

// Date formatting function
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Return to the previous page
const goBack = () => {
  router.back()
}
</script>

<template>
  <AdminLayout>
    <div class="p-4">
      <!-- Loading status -->
      <div v-if="loading" class="d-flex justify-content-center align-items-center" style="height: 16rem;">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <!-- User details -->
      <div v-else>
        <button @click="goBack" class="btn btn-link text-primary mb-3">
          <i class="pi pi-arrow-left"></i>
          Back to Ticket Users
        </button>
        <div class="card">
          <div class="card-header">
            <h2 class="fs-3">{{ userDetail.name }}</h2>
          </div>
          <div class="card-body">
            <p><strong>Email:</strong> {{ userDetail.email }}</p>
            <p><strong>Ticket Type:</strong> {{ userDetail.ticketType }}</p>
            <p><strong>Purchase Date:</strong> {{ formatDate(userDetail.purchaseDate) }}</p>
            <p v-if="userDetail.phone_no"><strong>Phone:</strong> {{ userDetail.phone_no }}</p>
            <!-- More fields can be added as needed -->
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.card {
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  padding: 1rem;
}
.card-header {
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 1rem;
}
</style>
