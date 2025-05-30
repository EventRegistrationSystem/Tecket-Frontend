<template>
  <AdminLayout>
    <div class="p-4"> <!-- Assuming AdminLayout provides container -->
      <!-- Page header -->
      <div class="mb-4">
        <h1 class="fs-2 fw-bold text-dark">Registrations for Event {{ eventId }}</h1>
        <!-- Optional: Add a subtitle like in EventsListView -->
        <!-- <p class="text-muted mt-1">View and manage registrations for this event</p> -->
      </div>

      <!-- Loading and error messages -->
      <div v-if="loading" class="alert alert-info">Loading registrations...</div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <!-- Action bar: search, status filter -->
      <div v-if="!loading && !error" class="bg-white rounded shadow-sm p-4 mb-4">
        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-3">
          <!-- Search & Filter -->
          <div class="d-flex flex-column flex-sm-row gap-3">
            <div class="position-relative">
              <input v-model="searchQuery" type="text" placeholder="Search by name or email..." class="form-control"
                style="padding-left: 2.5rem; max-width: 16rem;" />
              <i class="pi pi-search position-absolute text-muted" style="left: 1rem; top: 0.75rem;"></i>
            </div>
            <select v-model="statusFilter" class="form-select" style="max-width: 16rem;">
              <option value="">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
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
                <td colspan="8" class="px-3 py-4 text-center text-muted">
                  <div class="d-flex flex-column align-items-center">
                    <i class="pi pi-file-excel fs-1 mb-2"></i> <!-- Changed icon -->
                    <p class="fw-medium">No registrations found</p>
                    <p class="fs-6 mt-1">Try adjusting your filters or wait for new registrations.</p>
                  </div>
                </td>
              </tr>
              <tr v-for="reg in registrations" :key="reg.registrationId" class="border-bottom">
                <td class="px-3 py-2 text-dark">{{ reg.registrationId }}</td>
                <td class="px-3 py-2 text-dark">{{ formatDate(reg.registrationDate) }}</td>
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
                  <router-link :to="{ name: 'AdminRegistrationDetail', params: { registrationId: reg.registrationId } }"
                    class="btn btn-link text-primary p-0" title="View Details">
                    <i class="pi pi-eye"></i>
                  </router-link>
                  <!-- Add other action buttons here if needed later, e.g., edit, cancel -->
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="!loading && pagination.totalPages > 1"
          class="px-3 py-2 d-flex align-items-center justify-content-between border-top">
          <div class="fs-6 text-muted">
            Showing
            <span class="fw-medium">{{ (pagination.currentPage - 1) * pagination.limit + 1 }}</span> to
            <span class="fw-medium">{{ Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)
              }}</span> of
            <span class="fw-medium">{{ pagination.totalCount }}</span> results
          </div>
          <div class="d-flex gap-2">
            <button @click="changePage(pagination.currentPage - 1)" :disabled="pagination.currentPage === 1"
              class="btn btn-outline-secondary btn-sm">
              Previous
            </button>
            <!-- Simple page number display, can be enhanced if needed -->
            <button v-for="page in pagination.totalPages" :key="page" @click="changePage(page)"
              :class="['btn btn-sm', page === pagination.currentPage ? 'btn-primary' : 'btn-outline-secondary bg-light']">
              {{ page }}
            </button>
            <button @click="changePage(pagination.currentPage + 1)"
              :disabled="pagination.currentPage === pagination.totalPages" class="btn btn-outline-secondary btn-sm">
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
import { useRoute, useRouter } from 'vue-router'
import { getRegistrationsForEvent } from '@/api/registrationServices.js'
import AdminLayout from '@/views/admin/AdminLayout.vue' // Import AdminLayout

const route = useRoute()
const router = useRouter()

const eventId = ref(route.params.eventId)
const registrations = ref([])
const pagination = ref({
  currentPage: 1,
  limit: 10, // Default limit, can be made configurable
  totalCount: 0,
  totalPages: 1,
})
const loading = ref(false)
const error = ref(null)

const searchQuery = ref('')
const statusFilter = ref('')

const fetchRegistrations = async () => {
  loading.value = true
  error.value = null
  try {
    const params = {
      page: pagination.value.currentPage,
      limit: pagination.value.limit,
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
    }
    const response = await getRegistrationsForEvent(eventId.value, params)
    registrations.value = response.data
    pagination.value = {
      ...pagination.value,
      ...response.pagination,
    };
  } catch (err) {
    console.error('Failed to fetch registrations:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to load registrations.'
    registrations.value = []
    pagination.value = { ...pagination.value, totalCount: 0, totalPages: 1, currentPage: 1 };
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRegistrations()
})

watch(() => route.params.eventId, (newEventId) => {
  if (newEventId && newEventId !== eventId.value) { // Ensure it actually changed
    eventId.value = newEventId
    pagination.value.currentPage = 1
    searchQuery.value = '' // Reset filters for new event
    statusFilter.value = ''
    fetchRegistrations()
  }
})

// Debounce logic
let debounceTimer;
const debounce = (func, delay) => {
  return (...args) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const debouncedFetchRegistrations = debounce(() => {
  pagination.value.currentPage = 1;
  fetchRegistrations();
}, 500);

watch(searchQuery, () => {
  debouncedFetchRegistrations();
});

watch(statusFilter, () => {
  pagination.value.currentPage = 1;
  fetchRegistrations(); // Status filter changes can be immediate
});

const changePage = (page) => {
  if (page > 0 && page <= pagination.value.totalPages && page !== pagination.value.currentPage) {
    pagination.value.currentPage = page
    fetchRegistrations()
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  // Using en-AU as per EventsListView.vue example for consistency
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
</style>
