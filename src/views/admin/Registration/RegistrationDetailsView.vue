<template>
  <AdminLayout>
    <div class="p-4">
      <!-- Page header -->
      <div class="mb-4">
        <h1 class="fs-2 fw-bold text-dark">Registration Details #{{ registrationId }}</h1>
        <p v-if="registrationDetails" class="text-muted mt-1">Details for registration by {{ registrationDetails.participant?.firstName }} {{ registrationDetails.participant?.lastName }}</p>
      </div>

      <!-- Loading and error messages -->
      <div v-if="loading" class="alert alert-info">Loading registration details...</div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <!-- Registration Details -->
      <div v-if="!loading && !error && registrationDetails" class="bg-white rounded shadow-sm p-4">
        <h2 class="fs-4 fw-bold mb-3">Overview</h2>
        <div class="row mb-4">
          <div class="col-md-6">
            <p><strong>Status:</strong> <span :class="getStatusClass(registrationDetails.status)" class="px-2 py-1 rounded-pill small fw-medium">{{ registrationDetails.status }}</span></p>
            <p><strong>Registration Date:</strong> {{ formatDate(registrationDetails.created_at) }}</p>
            <p><strong>Total Amount Paid:</strong> {{ formatCurrency(registrationDetails.purchase?.totalPrice) }}</p>
          </div>
          <div class="col-md-6" v-if="registrationDetails.event">
            <p><strong>Event:</strong> {{ registrationDetails.event.name }}</p>
            <p><strong>Event Date:</strong> {{ formatDate(registrationDetails.event.startDateTime) }}</p>
            <!-- Link to event details? -->
          </div>
        </div>

        <hr class="my-4">

        <h2 class="fs-4 fw-bold mb-3">Primary Registrant</h2>
        <div v-if="registrationDetails.participant" class="row mb-4">
          <div class="col-md-6">
            <p><strong>Name:</strong> {{ registrationDetails.participant.firstName }} {{ registrationDetails.participant.lastName }}</p>
            <p><strong>Email:</strong> {{ registrationDetails.participant.email }}</p>
            <p v-if="registrationDetails.participant.phoneNumber"><strong>Phone:</strong> {{ registrationDetails.participant.phoneNumber }}</p>
          </div>
          <div class="col-md-6" v-if="registrationDetails.participant.address">
             <p><strong>Address:</strong> {{ registrationDetails.participant.address }}</p>
             <p>{{ registrationDetails.participant.city }}, {{ registrationDetails.participant.state }} {{ registrationDetails.participant.zipCode }}</p>
             <p>{{ registrationDetails.participant.country }}</p>
          </div>
        </div>
         <div v-else class="text-muted">Primary participant details not available.</div>


        <hr class="my-4">

        <h2 class="fs-4 fw-bold mb-3">Attendees ({{ registrationDetails.attendees?.length || 0 }})</h2>
        <div v-if="registrationDetails.attendees && registrationDetails.attendees.length > 0">
          <div v-for="(attendee, index) in registrationDetails.attendees" :key="attendee.id" class="card mb-3">
            <div class="card-header">
              Attendee #{{ index + 1 }}
            </div>
            <div class="card-body">
              <div v-if="attendee.participant">
                <p><strong>Name:</strong> {{ attendee.participant.firstName }} {{ attendee.participant.lastName }}</p>
                <p><strong>Email:</strong> {{ attendee.participant.email }}</p>
                <!-- Display other participant details if available -->
              </div>
              <div v-else class="text-muted">Participant details not available for this attendee.</div>

              <h3 v-if="attendee.responses && attendee.responses.length > 0" class="fs-5 mt-3 mb-2">Questionnaire Responses:</h3>
              <div v-if="attendee.responses && attendee.responses.length > 0">
                <div v-for="response in attendee.responses" :key="response.id" class="mb-2">
                  <p><strong>{{ response.eventQuestion?.question?.questionText || 'Question' }}:</strong> {{ response.responseText }}</p>
                </div>
              </div>
              <div v-else class="text-muted">No questionnaire responses for this attendee.</div>
            </div>
          </div>
        </div>
        <div v-else class="text-muted">No attendees found for this registration.</div>

        <hr class="my-4">

        <h2 class="fs-4 fw-bold mb-3">Tickets Purchased</h2>
         <div v-if="registrationDetails.purchase?.items && registrationDetails.purchase.items.length > 0">
            <ul class="list-group list-group-flush">
                <li v-for="item in registrationDetails.purchase.items" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center">
                    {{ item.quantity }} x {{ item.ticket?.name || 'Ticket' }}
                    <span class="badge bg-primary rounded-pill">{{ formatCurrency(item.quantity * parseFloat(item.unitPrice)) }}</span>
                </li>
            </ul>
         </div>
         <div v-else class="text-muted">No tickets purchased for this registration.</div>

        <!-- Add Payment Details section if needed -->
         <div v-if="registrationDetails.purchase?.payment">
             <hr class="my-4">
             <h2 class="fs-4 fw-bold mb-3">Payment Details</h2>
             <p><strong>Status:</strong> {{ registrationDetails.purchase.payment.status }}</p>
             <p><strong>Amount:</strong> {{ formatCurrency(registrationDetails.purchase.payment.amount) }}</p>
             <p><strong>Method:</strong> {{ registrationDetails.purchase.payment.method || 'N/A' }}</p>
             <!-- Add more payment details as available -->
         </div>


        <!-- Action Buttons (e.g., Update Status, Edit Details, Export) -->
        <div class="mt-4">
          <!-- Example: -->
          <!-- <button class="btn btn-primary me-2">Update Status</button> -->
          <!-- <button class="btn btn-secondary">Edit Details</button> -->
          <!-- <button class="btn btn-success">Export</button> -->
        </div>
      </div>

      <div v-if="!loading && !error && !registrationDetails" class="text-center py-4 text-gray-500">
        Registration details not found.
      </div>

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getRegistrationDetails } from '@/api/registrationServices.js'
import AdminLayout from '@/views/admin/AdminLayout.vue'

const route = useRoute()

const registrationId = ref(route.params.registrationId)
const registrationDetails = ref(null)
const loading = ref(false)
const error = ref(null)

const fetchRegistrationDetails = async () => {
  loading.value = true
  error.value = null
  registrationDetails.value = null // Clear previous details
  try {
    // The API response structure is { message, data: { registrationDetails } }
    const response = await getRegistrationDetails(registrationId.value)
    registrationDetails.value = response.data // Assuming the details are in response.data
  } catch (err) {
    console.error(`Failed to fetch registration details for ID ${registrationId.value}:`, err)
    error.value = err.response?.data?.message || err.message || 'Failed to load registration details.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRegistrationDetails()
})

watch(() => route.params.registrationId, (newId) => {
  if (newId && newId !== registrationId.value) {
    registrationId.value = newId
    fetchRegistrationDetails()
  }
})

// Helper functions (can be shared or moved to utilities)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const dateObj = new Date(dateString)
  if (isNaN(dateObj)) return 'N/A'
  return dateObj.toLocaleDateString('en-AU', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A'
  // Ensure amount is treated as a number for formatting
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return 'N/A';
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(numericAmount)
}

const getStatusClass = (status) => {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED':
      return 'bg-success-subtle text-success-emphasis'
    case 'PENDING':
      return 'bg-warning-subtle text-warning-emphasis'
    case 'CANCELLED':
      return 'bg-danger-subtle text-danger-emphasis'
    default:
      return 'bg-secondary-subtle text-secondary-emphasis'
  }
}

</script>

<style scoped>
/* Add any component-specific styles here if needed */
/* Ensure PrimeIcons are globally available or import them if needed */
/* For example: @import 'primeicons/primeicons.css'; if not already in main.js or similar */
</style>
