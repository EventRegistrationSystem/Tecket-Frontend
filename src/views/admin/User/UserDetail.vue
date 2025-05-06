<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { usersMockData } from '@/mock/usersMock.js'

const route = useRoute()
const router = useRouter()

const userId = route.params.userId


const user = ref(null)

onMounted(() => {
  user.value = usersMockData.find(u => u.id.toString() === userId)
})

const getRoleText = (role) => {
  switch (role) {
    case 'ADMIN':
      return 'ADMIN'
    case 'ORGANIZER':
      return 'ORGANIZER'
    case 'PARTICIPANT':
      return 'PARTICIPANT'
    default:
      return 'role'
  }
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const goBack = () => {
  router.push('/admin/users')
}
</script>

<template>
  <AdminLayout>
    <div class="p-4">
      <div class="mb-4 d-flex align-items-center">
        <button @click="goBack" class="btn btn-outline-secondary me-2" title="Back">
          <i class="pi pi-arrow-left me-1"></i>
          Back
        </button>
        <h1 class="display-6 mb-0">User Details</h1>
      </div>
      
      <div v-if="user" class="bg-white rounded shadow-sm p-4">
        <div class="mb-3">
          <strong>Name:</strong> {{ user.first_name }} {{ user.last_name }}
        </div>
        <div class="mb-3">
          <strong>Email:</strong> {{ user.email }}
        </div>
        <div class="mb-3">
          <strong>Phone:</strong> {{ user.phone_no }}
        </div>
        <div class="mb-3">
          <strong>Role:</strong> {{ getRoleText(user.role) }}
        </div>
        <div class="mb-3">
          <strong>Registration Date:</strong> {{ formatDate(user.created_at) }}
        </div>
      </div>
      
      <div v-else class="text-center mt-4">
        <p class="fw-medium">User not found.</p>
        <button @click="goBack" class="btn btn-secondary">Back to Users</button>
      </div>
    </div>
  </AdminLayout>
</template>