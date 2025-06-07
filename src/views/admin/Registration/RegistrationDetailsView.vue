<template>
  <AdminLayout>
    <div class="p-4">
      <!-- Page header -->
      <div class="mb-4">
        <h1 class="fs-2 fw-bold text-dark">Registration Details #{{ registrationId }}</h1>
        <p v-if="registrationDetails" class="text-muted mt-1">Details for registration by {{
          registrationDetails.participant?.firstName }} {{ registrationDetails.participant?.lastName }}</p>
      </div>

      <!-- Loading and error messages -->
      <div v-if="loading" class="alert alert-info">Loading registration details...</div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <!-- Registration Details -->
      <div v-if="!loading && !error && registrationDetails" class="bg-white rounded shadow-sm p-4">
        <h2 class="fs-4 fw-bold mb-3">Overview</h2>
        <div class="row mb-4">
          <div class="col-md-6">
            <p><strong>Status:</strong> <span :class="getStatusClass(registrationDetails.status)"
                class="px-2 py-1 rounded-pill small fw-medium">{{ registrationDetails.status }}</span></p>
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
            <p><strong>Name:</strong> {{ registrationDetails.participant.firstName }} {{
              registrationDetails.participant.lastName }}</p>
            <p><strong>Email:</strong> {{ registrationDetails.participant.email }}</p>
            <p v-if="registrationDetails.participant.phoneNumber"><strong>Phone:</strong> {{
              registrationDetails.participant.phoneNumber }}</p>
          </div>
          <div class="col-md-6" v-if="registrationDetails.participant.address">
            <p><strong>Address:</strong> {{ registrationDetails.participant.address }}</p>
            <p>{{ registrationDetails.participant.city }}, {{ registrationDetails.participant.state }} {{
              registrationDetails.participant.zipCode }}</p>
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

              <h3 v-if="attendee.responses && attendee.responses.length > 0" class="fs-5 mt-3 mb-2">Questionnaire
                Responses:</h3>
              <div v-if="attendee.responses && attendee.responses.length > 0">
                <div v-for="response in attendee.responses" :key="response.id" class="mb-2">
                  <p><strong>{{ response.eventQuestion?.question?.questionText || 'Question' }}:</strong> {{
                    response.responseText }}</p>
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
            <li v-for="item in registrationDetails.purchase.items" :key="item.id"
              class="list-group-item d-flex justify-content-between align-items-center">
              {{ item.quantity }} x {{ item.ticket?.name || 'Ticket' }}
              <span class="badge bg-primary rounded-pill">{{ formatCurrency(item.quantity * parseFloat(item.unitPrice))
              }}</span>
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
        <div class="mt-4 pt-3 border-top">
          <h3 class="fs-5 fw-bold mb-3">Update Status</h3>
          <div v-if="updateStatusSuccessMessage" class="alert alert-success">{{ updateStatusSuccessMessage }}</div>
          <div v-if="updateStatusError" class="alert alert-danger">{{ updateStatusError }}</div>

          <div class="row align-items-end">
            <div class="col-md-4 mb-3">
              <label for="statusSelect" class="form-label">New Status:</label>
              <select id="statusSelect" class="form-select" v-model="selectedStatus" :disabled="isUpdatingStatus">
                <option v-for="status in availableStatuses" :key="status" :value="status">
                  {{ status }}
                </option>
              </select>
            </div>
            <div class="col-md-auto mb-3">
              <button class="btn btn-primary" @click="handleUpdateStatus"
                :disabled="isUpdatingStatus || !selectedStatus || (registrationDetails && selectedStatus === registrationDetails.status)">
                <span v-if="isUpdatingStatus" class="spinner-border spinner-border-sm" role="status"
                  aria-hidden="true"></span>
                <span v-if="isUpdatingStatus"> Updating...</span>
                <span v-else>Update Status</span>
              </button>
            </div>
          </div>
          <!-- Other actions like Edit Details, Export can be added here -->
          <hr class="my-4">
          <h3 class="fs-5 fw-bold mb-3">Send Invoice</h3>
          <div v-if="sendInvoiceSuccessMessage" class="alert alert-success">{{ sendInvoiceSuccessMessage }}</div>
          <div v-if="sendInvoiceError" class="alert alert-danger">{{ sendInvoiceError }}</div>
          <button class="btn btn-info" @click="handleSendInvoice" :disabled="isSendingInvoice">
            <span v-if="isSendingInvoice" class="spinner-border spinner-border-sm" role="status"
              aria-hidden="true"></span>
            <span v-if="isSendingInvoice"> Sending...</span>
            <span v-else>Send Invoice Email</span>
          </button>
        </div>
      </div>

      <div v-if="!loading && !error && !registrationDetails" class="text-center py-4 text-gray-500">
        Registration details not found.
      </div>

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getRegistrationDetails, updateRegistrationStatus, sendInvoice } from '@/api/registrationServices.js'
import AdminLayout from '@/views/admin/AdminLayout.vue'

const route = useRoute()

const registrationId = ref(route.params.registrationId)
const registrationDetails = ref(null)
const loading = ref(false)
const error = ref(null)

// State for status update
const selectedStatus = ref('')
const isUpdatingStatus = ref(false)
const updateStatusError = ref(null)
const updateStatusSuccessMessage = ref(null)

// State for sending invoice
const isSendingInvoice = ref(false);
const sendInvoiceError = ref(null);
const sendInvoiceSuccessMessage = ref(null);

const availableStatuses = ['CONFIRMED', 'PENDING', 'CANCELLED'] // Add more if needed based on backend

const fetchRegistrationDetails = async () => {
  loading.value = true
  error.value = null
  registrationDetails.value = null // Clear previous details
  updateStatusError.value = null
  updateStatusSuccessMessage.value = null
  try {
    // The API response structure is { message, data: { registrationDetails } }
    const response = await getRegistrationDetails(registrationId.value)
    registrationDetails.value = response.data // Assuming the details are in response.data
    if (registrationDetails.value) {
      selectedStatus.value = registrationDetails.value.status // Initialize selectedStatus
    }
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
    fetchRegistrationDetails() // This will also reset selectedStatus
  }
})

const handleUpdateStatus = async () => {
  if (!selectedStatus.value || selectedStatus.value === registrationDetails.value.status) {
    updateStatusError.value = 'Please select a new status different from the current one.'
    return
  }
  isUpdatingStatus.value = true
  updateStatusError.value = null
  updateStatusSuccessMessage.value = null
  try {
    const response = await updateRegistrationStatus(registrationId.value, selectedStatus.value)
    if (response.data) {
      registrationDetails.value = response.data // Update with the full response data
      selectedStatus.value = response.data.status // Ensure selectedStatus reflects the new truth
      updateStatusSuccessMessage.value = response.message || 'Status updated successfully!'
    } else {
      // Fallback if response.data is not as expected, refetch to be safe
      await fetchRegistrationDetails() // This will re-initialize selectedStatus from the fetched data
      updateStatusSuccessMessage.value = 'Status updated successfully! Details refreshed.'
    }
  } catch (err) {
    console.error(`Failed to update status for registration ID ${registrationId.value}:`, err)
    updateStatusError.value = err.response?.data?.message || err.message || 'Failed to update status.'
  } finally {
    isUpdatingStatus.value = false
  }
}

const handleSendInvoice = async () => {
  if (!registrationDetails.value || !registrationDetails.value.participant || !registrationDetails.value.event) {
    sendInvoiceError.value = 'Cannot send invoice: required registration details are missing.';
    return;
  }

  isSendingInvoice.value = true;
  sendInvoiceError.value = null;
  sendInvoiceSuccessMessage.value = null;

  const invoiceData = {
    email: registrationDetails.value.participant.email,
    eventName: registrationDetails.value.event.name,
    startDateTime: registrationDetails.value.event.startDateTime,
    endDateTime: registrationDetails.value.event.endDateTime,
    location: registrationDetails.value.event.location,
  };

  try {
    const response = await sendInvoice(registrationId.value, invoiceData);
    sendInvoiceSuccessMessage.value = response.message || 'Invoice sent successfully!';
  } catch (err) {
    console.error(`Failed to send invoice for registration ID ${registrationId.value}:`, err);
    sendInvoiceError.value = err.response?.data?.message || err.message || 'Failed to send invoice.';
  } finally {
    isSendingInvoice.value = false;
  }
};

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
