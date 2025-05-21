<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { fetchEvents } from '@/api/eventServices.js'
import { fetchAllUsers } from '@/api/userServices.js'

// State variables
const eventsData = ref([])
const users = ref([])
const loading = ref(true)
const error = ref(null)

// Fetch events and users on component mount
onMounted(async () => {
  try {
    loading.value = true
    const response = await fetchEvents({ page: 1, limit: 100 })
    eventsData.value = response.events || []
    users.value = await fetchAllUsers()
  } catch (err) {
    error.value = err.message || 'Failed to load data'
  } finally {
    loading.value = false
  }
})

// Dashboard statistics
const totalEvents = computed(() => eventsData.value.length)
const activeEventsCount = computed(() =>
  eventsData.value.filter(e => ['Active', 'PUBLISHED'].includes(e.status)).length
)
const totalUsersCount = computed(() => users.value.length)

// Total revenue, summing price * quantitySold from nested tickets if available
const totalRevenue = computed(() =>
  eventsData.value.reduce((sum, e) => {
    if (Array.isArray(e.tickets)) {
      return sum + e.tickets.reduce((acc, t) => acc + Number(t.price) * t.quantitySold, 0)
    }
    return sum
  }, 0)
)

const statsData = computed(() => [
  { title: 'Total Events', value: totalEvents.value, bgColor: 'bg-primary', icon: 'pi pi-calendar' },
  { title: 'Active Events', value: activeEventsCount.value, bgColor: 'bg-success', icon: 'pi pi-check-circle' },
  { title: 'Total Users', value: totalUsersCount.value, bgColor: 'bg-warning', icon: 'pi pi-users' },
  { title: 'Total Revenue', value: `$${totalRevenue.value}`, bgColor: 'bg-info', icon: 'pi pi-dollar' }
])

// Recent events mapping to include display fields
const recentEvents = computed(() =>
  eventsData.value.slice(0, 5).map(e => ({
    ...e,
    displayDate: formatDate(e.startDateTime),
    revenueValue: Array.isArray(e.tickets)
      ? e.tickets.reduce((acc, t) => acc + Number(t.price) * t.quantitySold, 0)
      : 0
  }))
)

// Recent users slice
const recentUsers = computed(() =>
  users.value.slice(0, 5).map(u => ({
    id: u.id,
    name: `${u.firstName || u.first_name} ${u.lastName || u.last_name}`,
    email: u.email,
    registeredDate: u.createdAt || u.created_at,
    eventsAttended: u._count?.registrations || 0
  }))
)

// Utility functions
const formatDate = iso => {
  const d = new Date(iso)
  return isNaN(d) ? '' : d.toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getStatusClass = status => {
  switch (status) {
    case 'Active': case 'PUBLISHED':
      return 'bg-light text-success'
    case 'Upcoming':
      return 'bg-light text-primary'
    case 'Completed':
      return 'bg-light text-dark'
    case 'Cancelled':
      return 'bg-light text-danger'
    default:
      return 'bg-light text-dark'
  }
}
</script>

<template>
  <AdminLayout>
    <div class="p-3">
      <h1 class="fs-2 fw-bold text-dark mb-4">Dashboard</h1>

      <!-- Stats Cards Row -->
      <div class="row g-4 mb-4">
        <div v-for="(stat, index) in statsData" :key="index" class="col-12 col-md-6 col-lg-3">
          <div class="bg-white rounded shadow-sm overflow-hidden">
            <div class="p-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <p class="fs-6 text-muted">{{ stat.title }}</p>
                  <p class="fs-2 fw-bold text-dark mt-1">{{ stat.value }}</p>
                </div>
                <div :class="stat.bgColor + ' text-white p-3 rounded'">
                  <i :class="stat.icon + ' fs-4'"></i>
                </div>
              </div>
              <div class="mt-3">
                <span :class="stat.changeType === 'increase' ? 'text-success' : 'text-danger'" class="fs-6 d-flex align-items-center">
                  <i :class="stat.changeType === 'increase' ? 'pi pi-arrow-up' : 'pi pi-arrow-down'" class="me-1 fs-5"></i>
                  {{ stat.change }} since last month
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row g-4 mb-4">
        <!-- Sales Chart -->
        <div class="col-12 col-lg-6">
          <div class="bg-white rounded shadow-sm p-3">
            <h2 class="fs-5 fw-semibold text-dark mb-3">Ticket Sales Overview</h2>
            <div style="height: 20rem;">
              <!-- <Chart v-if="salesChartData" type="line" :data="salesChartData" :options="salesChartOptions" /> -->
            </div>
          </div>
        </div>
        
        <!-- Events by Category (placeholder) -->
        <div class="col-12 col-lg-6">
          <div class="bg-white rounded shadow-sm p-3">
            <h2 class="fs-5 fw-semibold text-dark mb-3">Events by Category</h2>
            <div class="d-flex align-items-center justify-content-center" style="height: 20rem;">
              <p class="text-muted">Chart will be implemented</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tables Row -->
      <div class="row g-4 mb-4">
        <!-- Recent Events Table -->
        <div class="col-12 col-lg-6">
          <div class="bg-white rounded shadow-sm p-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h2 class="fs-5 fw-semibold text-dark">Recent Events</h2>
              <a href="#" class="text-primary fs-6">View all</a>
            </div>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th class="px-3 py-2 text-start fs-6 text-muted">Event Name</th>
                    <th class="px-3 py-2 text-start fs-6 text-muted">Date</th>
                    <th class="px-3 py-2 text-start fs-6 text-muted">Status</th>
                    <th class="px-3 py-2 text-start fs-6 text-muted">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="event in recentEvents" :key="event.id">
                    <td class="px-3 py-2 fs-6 text-dark">{{ event.name }}</td>
                    <td class="px-3 py-2 fs-6 text-dark">{{ formatDate(event.startDateTime) }}</td>
                    <td class="px-3 py-2 fs-6">
                      <span :class="getStatusClass(event.status)" class="px-2 py-1 rounded-pill small">
                        {{ event.status }}
                      </span>
                    </td>
                    <td class="px-3 py-2 fs-6 text-dark">{{ '$' + event.tickets.reduce((sum, t) => sum + Number(t.price) * t.quantitySold, 0) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Recent Users Table -->
        <div class="col-12 col-lg-6">
          <div class="bg-white rounded shadow-sm p-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h2 class="fs-5 fw-semibold text-dark">Recent Users</h2>
              <a href="#" class="text-primary fs-6">View all</a>
            </div>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th class="px-3 py-2 text-start fs-6 text-muted">Name</th>
                    <th class="px-3 py-2 text-start fs-6 text-muted">Email</th>
                    <th class="px-3 py-2 text-start fs-6 text-muted">Registered</th>
                    <th class="px-3 py-2 text-start fs-6 text-muted">Events</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in recentUsers" :key="user.id">
                    <td class="px-3 py-2 fs-6 text-dark">{{ user.name }}</td>
                    <td class="px-3 py-2 fs-6 text-dark">{{ user.email }}</td>
                    <td class="px-3 py-2 fs-6 text-dark">{{ formatDate(user.registeredDate) }}</td>
                    <td class="px-3 py-2 fs-6 text-dark">{{ user.eventsAttended }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.no-border-btn:hover {
  background-color: #e9ecef;
}
</style>


