<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'

// Introducing interface methods from the API layer, based on code implementations you provide
import { fetchEventDetails } from '@/api/eventServices.js'

const route = useRoute()
const router = useRouter()
// Get the event id from the route parameter
const eventId = parseInt(route.params.id)

const event = ref(null)
const loading = ref(true)
const activeTab = ref('tickets')

// Initialise ticket types as empty array; wait for API response to update data
const ticketTypes = ref([])

onMounted(async () => {
  try {
    loading.value = true

    // Getting event details (internally using authFetch for authorised transfers)
    const fetchedEvent = await fetchEventDetails(eventId)
    // If the interface returns null, set the default data to avoid page errors
    event.value = fetchedEvent || {
      id: eventId,
      name: 'Event not found',
      description: '',
      startDateTime: '',
      endDateTime: '',
      location: '',
      address: '',
      organizer: { firstName: '', lastName: '' },
      organizerContact: '',
      status: '',
      capacity: 100,
      ticketsSold: 10,
      revenue: '',
      imageUrl: '',
      eventType: '',      
      isFree: false       
    }

    // Populate ticketTypes from event.value.tickets
    if (event.value && event.value.tickets) {
      ticketTypes.value = event.value.tickets.map(t => ({
        id: t.id,
        name: t.name,
        price: t.price,
        quantitySold: t.quantitySold || 0,
        quantityTotal: t.quantityTotal || 0,
        salesEnd: t.salesEnd
      }));
    } else {
      ticketTypes.value = [];
    }
  } catch (error) {
    console.error("Error fetching event data:", error)
    // Setting the default data in case of error to prevent the page from reporting errors
    event.value = {
      id: eventId,
      name: 'Event not found',
      description: '',
      startDateTime: '',
      endDateTime: '',
      location: '',
      address: '',
      organizer: { firstName: '', lastName: '' },
      organizerContact: '',
      status: '',
      capacity: 0,
      ticketsSold: 0,
      revenue: '',
      imageUrl: '',
      eventType: '',      
      isFree: false 
    }
    ticketTypes.value = []
  } finally {
    loading.value = false
  }
})

const editEvent = () => {
  router.push(`/admin/events/edit/${eventId}`)
}

// Function to navigate to edit event form with a specific tab active
const editEventWithTab = (tabName) => {
  router.push({
    path: `/admin/events/edit/${eventId}`,
    query: { tab: tabName } // Changed 'activeTab' to 'tab'
  })
}

// Formatted date (en-US)
// Add a validity judgement to ensure that the incoming date string is parsed correctly
const formatDate = (dateString) => {
  if (!dateString) return ''
  const dateObj = new Date(dateString)
  if (isNaN(dateObj)) return ''
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Formatting time (en-US)
// Add validity judgement to ensure that incoming date strings are parsed correctly
const formatTime = (dateString) => {
  if (!dateString) return ''
  const dateObj = new Date(dateString)
  if (isNaN(dateObj)) return ''
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Helper function to format currency values
const formatCurrency = (value) => {
  if (typeof value !== 'number') return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'AUD' }).format(value);
}

// Returns the corresponding CSS class name based on the event state to set the text colour background
const getStatusClass = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-light text-success'
    case 'Upcoming':
      return 'bg-light text-primary'
    case 'Completed':
      return 'bg-light text-dark'
    case 'Cancelled':
      return 'bg-light text-danger'
    case 'PUBLISHED':
      return 'bg-light text-primary'
    default:
      return 'bg-light text-dark'
  }
}
</script>

<template>
  <AdminLayout>
    <div class="p-3">
      <!-- load state -->
      <div v-if="loading" class="d-flex justify-content-center align-items-center" style="height: 16rem;">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else>
        <!-- Back button -->
        <button @click="router.push('/admin/events')" class="d-flex align-items-center text-primary mb-3" type="button">
          <i class="pi pi-arrow-left me-1"></i>
          Back to Events
        </button>

        <!-- event header information -->
        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between mb-4">
          <div>
            <h1 class="fs-2 fw-bold text-dark">{{ event.name }}</h1>
            <div class="d-flex align-items-center mt-2">
              <span :class="getStatusClass(event.status)" class="px-2 py-1 rounded-pill small fw-semibold me-2">
                {{ event.status }}
              </span>
              <!-- Date Formatting with startDateTime -->
              <span class="text-muted">{{ formatDate(event.startDateTime) }}</span>
            </div>
          </div>
          <div class="mt-4 mt-md-0">
            <button @click="editEvent" class="btn btn-primary" type="button">
              <i class="pi pi-pencil me-2"></i>
              Edit Event
            </button>
          </div>
        </div>

        <!-- Detailed content of the incident -->
        <div class="row g-4">
          <!-- Left: Details and Tabs switching -->
          <div class="col-12 col-lg-8">
            <!-- Event Pictures & Profile Cards -->
            <div class="bg-white rounded shadow-sm overflow-hidden mb-4">
              <img :src="event.imageUrl" :alt="event.name" class="w-100"
                   style="height: 16rem; object-fit: cover;">
              <div class="p-4">
                <h2 class="fs-4 fw-semibold text-dark mb-3">About This Event</h2>
                <p class="text-secondary mb-3">{{ event.description }}</p>

                <div class="row g-4 mt-3">
                  <div class="col-12 col-md-6">
                    <h3 class="fs-6 fw-semibold text-muted mb-1">Date and Time</h3>
                    <!-- Display event date and start-end time -->
                    <p class="text-dark mb-0">{{ formatDate(event.startDateTime) }}</p>
                    <p class="text-dark">
                      {{ formatTime(event.startDateTime) }} - {{ formatTime(event.endDateTime) }}
                    </p>
                  </div>

                  <div class="col-12 col-md-6">
                    <h3 class="fs-6 fw-semibold text-muted mb-1">Location</h3>
                    <p class="text-dark mb-0">{{ event.location }}</p>
                    <p class="text-muted">{{ event.address }}</p>
                  </div>

                  <div class="col-12 col-md-6">
                    <h3 class="fs-6 fw-semibold text-muted mb-1">Organizer</h3>
                    <p class="text-dark mb-0">
                      <!-- Judgement based on organizer data type -->
                      {{ typeof event.organizer === 'string' ? event.organizer : (event.organizer.firstName + ' ' + event.organizer.lastName) }}
                    </p>
                    <p class="text-muted">{{ event.organizerContact }}</p>
                  </div>

                  <div class="col-12 col-md-6">
                    <h3 class="fs-6 fw-semibold text-muted mb-1">Capacity</h3>
                    <p class="text-dark mb-1">{{ event.ticketsSold }} / {{ event.capacity }} tickets sold</p>
                    <div class="progress" style="height: 0.5rem;">
                      <div class="progress-bar bg-primary" role="progressbar"
                           :style="{ width: (event.ticketsSold / event.capacity) * 100 + '%' }"
                           aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                  </div>
                  <!-- Event Type -->
                  <div class="col-12 col-md-6">
                    <h3 class="fs-6 fw-semibold text-muted mb-1">Event Type</h3>
                    <p class="text-dark mb-0">{{ event.eventType }}</p>
                  </div>

                  <!-- Is Free? -->
                  <div class="col-12 col-md-6">
                    <h3 class="fs-6 fw-semibold text-muted mb-1">Price Type</h3>
                    <p class="text-dark mb-0">{{ event.isFree ? 'Free' : 'Paid' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tabs Navigation -->
            <div class="bg-white rounded shadow-sm overflow-hidden">
              <div class="d-flex border-bottom">
                <button @click="activeTab = 'tickets'" type="button"
                        class="px-3 py-2 fs-6 fw-semibold bg-light border-0 no-border-btn"
                        :class="activeTab === 'tickets' ? 'text-primary' : 'text-muted'">
                  Tickets
                </button>
                <button @click="activeTab = 'questions'" type="button"
                        class="px-3 py-2 fs-6 fw-semibold bg-light border-0 no-border-btn"
                        :class="activeTab === 'questions' ? 'text-primary' : 'text-muted'">
                  Questions
                </button>
              </div>

              <!-- Tab Content -->
              <div class="p-3">
                <!-- Questions Tab -->
                <div v-if="activeTab === 'questions'">
                  <h3 class="fs-5 fw-semibold mb-3">Event Questions</h3>
                  <div v-if="event && event.eventQuestions && event.eventQuestions.length">
                    <ul class="list-group">
                      <li v-for="eq in event.eventQuestions" :key="eq.id" class="list-group-item">
                        {{ eq.question.questionText }}
                      </li>
                    </ul>
                  </div>
                  <div v-else>
                    <p class="text-muted">No questions have been configured for this event.</p>
                  </div>
                  <div class="mt-3 d-flex justify-content-end">
                    <button @click="editEventWithTab('questionnaire')" class="btn btn-primary" type="button">
                      <i class="pi pi-receipt me-2"></i>
                      Manage Questions
                    </button>
                  </div>
                </div>

                <!-- Tickets Tab -->
                <div v-if="activeTab === 'tickets'">
                  <div class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr class="bg-light border-bottom">
                          <th class="px-3 py-2 text-start fs-6 fw-semibold text-muted">Name</th>
                          <th class="px-3 py-2 text-start fs-6 fw-semibold text-muted">Price</th>
                          <th class="px-3 py-2 text-start fs-6 fw-semibold text-muted">Sold</th>
                          <th class="px-3 py-2 text-start fs-6 fw-semibold text-muted">Available</th>
                          <th class="px-3 py-2 text-start fs-6 fw-semibold text-muted">Total</th>
                          <th class="px-3 py-2 text-start fs-6 fw-semibold text-muted">Sales End Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="ticket in ticketTypes" :key="ticket.id" class="border-bottom">
                          <td class="px-3 py-2 text-dark">{{ ticket.name }}</td>
                          <td class="px-3 py-2 text-dark">{{ formatCurrency(ticket.price) }}</td>
                          <td class="px-3 py-2 text-dark">{{ ticket.quantitySold }}</td>
                          <td class="px-3 py-2 text-dark">{{ ticket.quantityTotal - ticket.quantitySold }}</td>
                          <td class="px-3 py-2 text-dark">{{ ticket.quantityTotal }}</td>
                          <td class="px-3 py-2 text-dark">{{ formatDate(ticket.salesEnd) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="mt-3 d-flex justify-content-end">
                    <button 
                    @click="editEventWithTab('tickets')" 
                    class="btn btn-primary" type="button">
                      <i class="pi pi-ticket me-2"></i>
                      Manage Tickets
                    </button>
                  </div>
                </div>

                <!-- Attendees tab has been removed -->
              </div>
            </div>
          </div>

          <!-- Right: Quick Action -->
          <div class="col-12 col-lg-4">
            <!-- Quick Stats -->
            <div class="bg-white rounded shadow-sm p-3 mb-4">
              <h2 class="fs-5 fw-semibold text-dark mb-3">Event Stats</h2>
              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fs-6 text-muted">Tickets Sold</span>
                  <span class="fs-6 fw-semibold">{{ event.ticketsSold }}/{{ event.capacity }}</span>
                </div>
                <div class="progress" style="height: 0.5rem;">
                  <div class="progress-bar bg-primary" role="progressbar"
                       :style="{ width: (event.ticketsSold / event.capacity) * 100 + '%' }"
                       aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fs-6 text-muted">Revenue</span>
                  <span class="fs-6 fw-semibold">{{ event.revenue }}</span>
                </div>
                <div class="progress" style="height: 0.5rem;">
                  <div class="progress-bar bg-success" role="progressbar" style="width: 45%;" aria-valuenow="45"
                       aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>
            </div>

            <!-- Quick Operation Buttons -->
            <div class="bg-white rounded shadow-sm p-3 mb-4">
              <h2 class="fs-5 fw-semibold text-dark mb-3">Quick Actions</h2>
              <div class="d-grid gap-3">
                <button class="btn btn-outline-primary w-100 d-flex align-items-center" type="button">
                  <i class="pi pi-share-alt me-2"></i>
                  Share Event
                </button>
                
                <button class="btn btn-outline-success w-100 d-flex align-items-center" type="button">
                  <i class="pi pi-chart-bar me-2"></i>
                  View Reports
                </button>
                <button v-if="event.status !== 'Cancelled'" class="btn btn-outline-danger w-100 d-flex align-items-center"
                        type="button">
                  <i class="pi pi-times-circle me-2"></i>
                  Cancel Event
                </button>
                <button v-if="event.status === 'Cancelled'" 
                class="btn btn-outline-success w-100 d-flex align-items-center"
                        type="button">
                  <i class="pi pi-check-circle me-2"></i>
                  Reactivate Event
                </button>
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
