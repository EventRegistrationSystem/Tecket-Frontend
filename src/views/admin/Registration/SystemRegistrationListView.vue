<template>
  <AdminLayout>
    <div class="p-4">
      <!-- Page header -->
      <div class="mb-4">
        <h1 class="fs-2 fw-bold text-dark">All System Registrations</h1>
        <p class="text-muted mt-1">View and manage all registrations across the system</p>
      </div>

      <!-- Loading and error messages -->
      <div v-if="loading" class="alert alert-info">Loading registrations...</div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <!-- Action bar: search, filters -->
      <div v-if="!loading && !error" class="bg-white rounded shadow-sm p-4 mb-4">
        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-3">
          <!-- Search & Filters -->
          <div class="d-flex flex-column flex-sm-row flex-wrap gap-3">
            <div class="position-relative">
              <input
                v-model="searchQuery"
                @input="fetchRegistrations"
                type="text"
                placeholder="Search name or email..."
                class="form-control"
                style="padding-left: 2.5rem; max-width: 16rem;"
              />
              <i class="pi pi-search position-absolute text-muted" style="left: 1rem; top: 0.75rem;"></i>
            </div>
            <select
              v-model="statusFilter"
              @change="fetchRegistrations"
              class="form-select"
              style="max-width: 16rem;"
            >
              <option value="">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <!-- Additional Filters -->
            <input
              v-model="eventIdFilter"
              @input="fetchRegistrations"
              type="number"
              placeholder="Filter by Event ID"
              class="form-control"
              style="max-width: 10rem;"
            />
             <input
              v-model="userIdFilter"
              @input="fetchRegistrations"
              type="number"
              placeholder="Filter by User ID"
              class="form-control"
              style="max-width: 10rem;"
            />
             <input
              v-model="participantIdFilter"
              @input="fetchRegistrations"
              type="number"
              placeholder="Filter by Participant ID"
              class="form-control"
              style="max-width: 12rem;"
            />
            <!-- Add Ticket ID filter if needed later -->
          </div>
          <!-- Placeholder for potential future buttons like "Export" -->
        </div>
      </div>

      <!-- Registrations Table -->
      <div v-if="!loading && !error" class="bg-white rounded shadow-sm overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr class="bg-light border-bottom">
                <th class="px-3 py-2 text-start fs-6 text-muted">Reg. ID</th>
                <th class="px-3 py-2 text-start fs-6 text-muted">Date</th>
                 <th class="px-3 py-2 text-start fs-6 text-muted">Event Name</th> <!-- New Column -->
                <th class="px-3 py-2 text-start fs-6 text-muted">Primary Registrant</th>
                <th class="px-3 py-2 text-start fs-6 text-muted">Email</th>
                <th class="px-3 py-2 text-start fs-6 text-muted text-center"># Attendees</th>
                <th class="px-3 py-2 text-start fs-6 text-muted">Status</th>
                <th class="px-3 py-2 text-start fs-6 text-muted">Amount Paid</th>
                <th class="px-3 py-2 text-center fs-6 text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="registrations.length === 0">
                <td colspan="9" class="px-3 py-4 text-center text-muted"> <!-- Increased colspan -->
                  <div class="d-flex flex-column align-items-center">
                    <i class="pi pi-file-excel fs-1 mb-2"></i>
                    <p class="fw-medium">No registrations found</p>
                    <p class="fs-6 mt-1">Try adjusting your filters.</p>
                  </div>
                </td>
              </tr>
              <tr v-for="reg in registrations" :key="reg.registrationId" class="border-bottom">
                <td class="px-3 py-2 text-dark">{{ reg.registrationId }}</td>
                <td class="px-3 py-2 text-dark">{{ formatDate(reg.registrationDate) }}</td>
                 <td class="px-3 py-2 text-dark">{{ reg.eventName }}</td> <!-- Display Event Name -->
                <td class="px-3 py-2 fw-medium text-dark">{{ reg.primaryParticipantName }}</td>
                <td class="px-3 py-2 text-muted">{{ reg.primaryParticipantEmail }}</td>
                <td class="px-3 py-2 text-dark text-center">{{ reg.numberOfAttendees }}</td>
                <td class="px-3 py-2">
                  <span :class="getStatusClass(reg.registrationStatus)" class="px-2 py-1 rounded-pill small fw-medium">
                    {{ reg.registrationStatus }}
                  </span>
                </td>
                <td class="px-3 py-2 text-dark">{{ formatCurrency(reg.totalAmountPaid) }}</td>
                <td class="px-3 py-2 text-center">
                  <router-link
                    :to="{ name: 'AdminRegistrationDetail', params: { registrationId: reg.registrationId } }"
                    class="btn btn-link text-primary p-0"
                    title="View Details"
                  >
                    <i class="pi pi-eye"></i>
                  </router-link>
                  <!-- Add other action buttons here if needed later, e.g., edit, cancel -->
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="!loading && pagination.totalPages > 1" class="px-3 py-2 d-flex align-items-center justify-content-between border-top">
          <div class="fs-6 text-muted">
            Showing
            <span class="fw-medium">{{ (pagination.currentPage - 1) * pagination.limit + 1 }}</span> to
            <span class="fw-medium">{{ Math.min(pagination.currentPage * pagination.limit, pagination.totalCount) }}</span> of
            <span class="fw-medium">{{ pagination.totalCount }}</span> results
          </div>
          <div class="d-flex gap-2">
            <button
              @click="changePage(pagination.currentPage - 1)"
              :disabled="pagination.currentPage === 1"
              class="btn btn-outline-secondary btn-sm"
            >
              Previous
            </button>
            <!-- Simple page number display, can be enhanced if needed -->
            <button
              v-for="page in pagination.totalPages"
              :key="page"
              @click="changePage(page)"
              :class="['btn btn-sm', page === pagination.currentPage ? 'btn-primary' : 'btn-outline-secondary bg-light']"
            >
              {{ page }}
            </button>
            <button
              @click="changePage(pagination.currentPage + 1)"
              :disabled="pagination.currentPage === pagination.totalPages"
              class="btn btn-outline-secondary btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getSystemRegistrations } from '@/api/registrationServices.js'
import AdminLayout from '@/views/admin/AdminLayout.vue'

const router = useRouter()

const registrations = ref([])
const pagination = ref({
  currentPage: 1,
  limit: 10, // Default limit, can be made configurable
  totalCount: 0,
  totalPages: 1,
})
const loading = ref(false)
const error = ref(null)

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const eventIdFilter = ref(null) // Use null for number inputs when empty
const userIdFilter = ref(null)
const participantIdFilter = ref(null)


const fetchRegistrations = async () => {
  loading.value = true
  error.value = null
  try {
    const params = {
      page: pagination.value.currentPage,
      limit: pagination.value.limit,
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
      eventId: eventIdFilter.value || undefined,
      userId: userIdFilter.value || undefined,
      participantId: participantIdFilter.value || undefined,
    }
    // The API response structure is { message, data: [], pagination: {} }
    const response = await getSystemRegistrations(params)

    registrations.value = response.data
    pagination.value = {
      ...pagination.value,
      ...response.pagination,
    };
  } catch (err) {
    console.error('Failed to fetch system registrations:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to load system registrations.'
    registrations.value = []
    pagination.value = { ...pagination.value, totalCount: 0, totalPages: 1, currentPage: 1 };
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRegistrations()
})

// Watch filters and pagination changes
watch([searchQuery, statusFilter, eventIdFilter, userIdFilter, participantIdFilter], () => {
  pagination.value.currentPage = 1; // Reset to first page on filter change
  fetchRegistrations();
});

watch(() => pagination.value.currentPage, () => {
    fetchRegistrations(); // Fetch when page changes
});


const changePage = (page) => {
  if (page > 0 && page <= pagination.value.totalPages && page !== pagination.value.currentPage) {
    pagination.value.currentPage = page
    // Watcher for pagination.value.currentPage will trigger fetchRegistrations
  }
}

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
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount)
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
