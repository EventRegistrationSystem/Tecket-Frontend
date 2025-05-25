<script setup>
import { ref, onMounted, computed } from 'vue'
import AdminLayout from '@/views/admin/AdminLayout.vue'
import { useUserStore } from '@/store/userStore'
import { fetchEvents } from '@/api/eventServices.js'
import { fetchAllUsers } from '@/api/userServices.js'
import { getSystemRegistrations, getRegistrationsForEvent } from '@/api/registrationServices.js'

// State variables
const userStore = useUserStore()
const currentUser = computed(() => userStore.currentUser)
const isAuthenticated = computed(() => userStore.isAuthenticated)

const eventsData = ref([])
const usersData = ref([])
const systemRegistrationsData = ref(null) // For admin total registrations
const organizerRegistrationsData = ref([]) // For organizer total participants
const loading = ref(true)
const error = ref(null)

// Fetch dashboard data based on user role
onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    if (!isAuthenticated.value) {
      error.value = 'User not authenticated.'
      return
    }

    // Fetch events (common for both roles, but params differ)
    const eventsResponse = await fetchEvents(
      {},
      { isPublicView: currentUser.value?.role === 'ADMIN' } // Admins get all published, Organizers get their own
    )
    eventsData.value = eventsResponse.events || []

    if (currentUser.value?.role === 'ADMIN') {
      // Admin-specific data fetches
      const usersResponse = await fetchAllUsers()
      usersData.value = usersResponse.users || usersResponse || [] // Adjust based on actual fetchAllUsers return

      const systemRegResponse = await getSystemRegistrations({})
      systemRegistrationsData.value = systemRegResponse.pagination || null

    } else if (currentUser.value?.role === 'ORGANIZER') {
      // Organizer-specific data fetches
      // For "Total Participants in Your Events", we need to sum attendees from registrations for their events
      const registrationsPromises = eventsData.value.map(event =>
        getRegistrationsForEvent(event.id, {})
      )
      const allEventRegistrations = await Promise.all(registrationsPromises)
      organizerRegistrationsData.value = allEventRegistrations.flatMap(
        response => response.data || []
      )
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to load data'
  } finally {
    loading.value = false
  }
})

// Computed properties for dashboard statistics
const totalEventsCount = computed(() => eventsData.value.length)

const publishedEventsCount = computed(() =>
  eventsData.value.filter(e => e.status === 'PUBLISHED').length
)

const upcomingEventsCount = computed(() => {
  const now = new Date()
  return eventsData.value.filter(e => new Date(e.startDateTime) > now).length
})

const totalUsersCount = computed(() => usersData.value.length)

const totalRegistrationsCount = computed(() =>
  systemRegistrationsData.value ? systemRegistrationsData.value.totalCount : 0
)

const totalParticipantsInOrganizerEvents = computed(() => {
  return organizerRegistrationsData.value.reduce((sum, reg) => sum + (reg.numberOfAttendees || 0), 0);
});


// Dashboard statistics data for cards
const statsData = computed(() => {
  if (currentUser.value?.role === 'ADMIN') {
    return [
      { title: 'Total Events (Published)', value: totalEventsCount.value, bgColor: 'bg-primary', icon: 'pi pi-calendar' },
      { title: 'Total Registrations', value: totalRegistrationsCount.value, bgColor: 'bg-success', icon: 'pi pi-user-plus' },
      { title: 'Total Users', value: totalUsersCount.value, bgColor: 'bg-warning', icon: 'pi pi-users' },
      { title: 'Published Events', value: publishedEventsCount.value, bgColor: 'bg-info', icon: 'pi pi-check-circle' }
    ]
  } else if (currentUser.value?.role === 'ORGANIZER') {
    return [
      { title: 'Your Total Events', value: totalEventsCount.value, bgColor: 'bg-primary', icon: 'pi pi-calendar' },
      { title: 'Your Published Events', value: publishedEventsCount.value, bgColor: 'bg-success', icon: 'pi pi-check-circle' },
      { title: 'Your Upcoming Events', value: upcomingEventsCount.value, bgColor: 'bg-info', icon: 'pi pi-clock' },
      { title: 'Total Participants (Your Events)', value: totalParticipantsInOrganizerEvents.value, bgColor: 'bg-warning', icon: 'pi pi-users' }
    ]
  }
  return []
})

// Recent events mapping
const recentEvents = computed(() =>
  eventsData.value.slice(0, 5).map(e => ({
    ...e,
    displayDate: formatDate(e.startDateTime),
    // For organizers, we need to get registration count per event
    // For admins, we can show published status
    registrationsCount: e._count?.registrations || 0 // Assuming _count.registrations is available on event object
  }))
)

// Recent users slice (Admin only)
const recentUsers = computed(() =>
  usersData.value.slice(0, 5).map(u => ({
    id: u.id,
    name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
    email: u.email,
    registeredDate: u.createdAt,
    eventsAttended: u._count?.registrations || 0
  }))
)

// Recent registrations for organizer (instead of recent users)
const recentOrganizerRegistrations = computed(() => {
  // Sort all fetched registrations for organizer's events by registrationDate descending
  return [...organizerRegistrationsData.value]
    .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
    .slice(0, 5)
    .map(reg => ({
      id: reg.registrationId,
      eventName: reg.eventName, // Assuming eventName is part of registration summary
      primaryParticipantName: reg.primaryParticipantName,
      registrationDate: reg.registrationDate,
      status: reg.registrationStatus,
      numberOfAttendees: reg.numberOfAttendees
    }));
});


// Utility functions
const formatDate = iso => {
  const d = new Date(iso)
  return isNaN(d) ? '' : d.toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getStatusClass = status => {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-light text-success'
    case 'DRAFT':
      return 'bg-light text-secondary'
    case 'COMPLETED':
      return 'bg-light text-dark'
    case 'CANCELLED':
      return 'bg-light text-danger'
    case 'CONFIRMED':
      return 'bg-light text-success'
    case 'PENDING':
      return 'bg-light text-warning'
    default:
      return 'bg-light text-dark'
  }
}
</script>

<template>
  <AdminLayout>
    <div class="p-3">
      <h1 class="fs-2 fw-bold text-dark mb-4">Dashboard</h1>

      <div v-if="loading" class="text-center mt-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mt-2">Loading dashboard data...</p>
      </div>
      <div v-else-if="error" class="alert alert-danger text-center mt-5">
        {{ error }}
      </div>
      <div v-else>
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
                <!-- Removed "since last month" change indicator for simplification -->
              </div>
            </div>
          </div>
        </div>
        
        <!-- Tables Row -->
        <div class="row g-4 mb-4">
          <!-- Recent Events Table (Common for both roles) -->
          <div class="col-12 col-lg-6">
            <div class="bg-white rounded shadow-sm p-3">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="fs-5 fw-semibold text-dark">Recent Events</h2>
                <router-link to="/admin/events" class="text-primary fs-6">View all</router-link>
              </div>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th class="px-3 py-2 text-start fs-6 text-muted">Event Name</th>
                      <th class="px-3 py-2 text-start fs-6 text-muted">Date</th>
                      <th class="px-3 py-2 text-start fs-6 text-muted">Status</th>
                      <th class="px-3 py-2 text-start fs-6 text-muted">Registrations</th>
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
                      <td class="px-3 py-2 fs-6 text-dark">{{ event.registrationsCount }}</td>
                    </tr>
                    <tr v-if="!recentEvents.length">
                      <td colspan="4" class="text-center text-muted py-3">No recent events to display.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <!-- Dynamic Second Table based on Role -->
          <div class="col-12 col-lg-6">
            <div class="bg-white rounded shadow-sm p-3">
              <div v-if="currentUser?.role === 'ADMIN'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h2 class="fs-5 fw-semibold text-dark">Recent Users</h2>
                  <router-link to="/admin/users" class="text-primary fs-6">View all</router-link>
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
                      <tr v-if="!recentUsers.length">
                        <td colspan="4" class="text-center text-muted py-3">No recent users to display.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-else-if="currentUser?.role === 'ORGANIZER'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h2 class="fs-5 fw-semibold text-dark">Recent Registrations (Your Events)</h2>
                  <router-link to="/admin/registrations" class="text-primary fs-6">View all</router-link>
                </div>
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th class="px-3 py-2 text-start fs-6 text-muted">Event</th>
                        <th class="px-3 py-2 text-start fs-6 text-muted">Registrant</th>
                        <th class="px-3 py-2 text-start fs-6 text-muted">Date</th>
                        <th class="px-3 py-2 text-start fs-6 text-muted">Attendees</th>
                        <th class="px-3 py-2 text-start fs-6 text-muted">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="reg in recentOrganizerRegistrations" :key="reg.id">
                        <td class="px-3 py-2 fs-6 text-dark">{{ reg.eventName }}</td>
                        <td class="px-3 py-2 fs-6 text-dark">{{ reg.primaryParticipantName }}</td>
                        <td class="px-3 py-2 fs-6 text-dark">{{ formatDate(reg.registrationDate) }}</td>
                        <td class="px-3 py-2 fs-6 text-dark">{{ reg.numberOfAttendees }}</td>
                        <td class="px-3 py-2 fs-6">
                          <span :class="getStatusClass(reg.status)" class="px-2 py-1 rounded-pill small">
                            {{ reg.status }}
                          </span>
                        </td>
                      </tr>
                      <tr v-if="!recentOrganizerRegistrations.length">
                        <td colspan="5" class="text-center text-muted py-3">No recent registrations to display.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
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
