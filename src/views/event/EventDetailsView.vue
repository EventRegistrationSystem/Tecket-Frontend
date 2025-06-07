<template>
  <div>
    <navbar />
    <div class="container mt-3 mb-5">
      <div v-if="loading" class="text-center mt-5">Data loading...</div>
      <div v-else-if="error" class="text-center mt-5 text-danger">
        Data loading failed, please try again later!
      </div>
      <div v-else class="row">
        <div class="col-7">
          <img :src="eventDetail.imageUrl || defaultBanner" alt="img" class="img-fluid" />
          <h4 class="fw-semibold mt-4">Description</h4>
          <p class="mt-3">{{ eventDetail.description }}</p>
          <h5>📅 Date & Time:</h5>
          <ul>
            <li>
              <strong>When:</strong>
              {{ formatDate(eventDetail.startDateTime) }} - {{ formatDate(eventDetail.endDateTime) }}
            </li>
            <li>
              <strong>Where:</strong> {{ eventDetail.location }}
            </li>
          </ul>
        </div>
        <div class="col-5 text-start align-item-center">
          <h1 class="fw-bold">{{ eventDetail.name }}</h1>
          <p class="text-warning fw-semibold">
            {{ formatDate(eventDetail.startDateTime) }} - {{ formatDate(eventDetail.endDateTime) }}
          </p>
          <h3 class="fw-bold">Location</h3>
          <p class="text-secondary" style="margin-top: -2%">
            Type: {{ eventDetail.eventType }}
          </p>
          <p class="fw-semibold" style="margin-top: -1%">
            Venue: {{ eventDetail.location }}
          </p>
          <div class="mapouter">
            <div class="gmap_canvas">
              <iframe width="400" height="400" :src="mapUrl" frameborder="0" scrolling="no" marginheight="0"
                marginwidth="0"></iframe>
            </div>
          </div>
          <div class="align-item-center mt-5">
            <button class="btn btn-outline-warning fw-semibold" @click="startRegistration">
              Register now
            </button>
          </div>
          <div class="align-item-center mt-3">
            <router-link to="/events">
              <button class="btn btn-secondary">
                Back to events
              </button>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import navbar from '@/components/Navbar.vue'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRegistrationStore } from '@/store/registrationStore'
import { fetchEventDetails } from '@/api/eventServices'

const route = useRoute()
const router = useRouter()
const registrationStore = useRegistrationStore()
const eventId = route.params.id

const eventDetail = ref(null)
const loading = ref(true)
const error = ref(null)
const defaultBanner = 'https://placehold.co/800x400?text=Event+Banner'

// Generate a map URL based on location
const mapUrl = computed(() => {
  if (eventDetail.value && eventDetail.value.location) {
    const encoded = encodeURIComponent(eventDetail.value.location)
    return `https://maps.google.com/maps?q=${encoded}&t=&z=13&ie=UTF8&iwloc=&output=embed`
  }
  return ''
})

// Formatting a Date String
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString()
}

const startRegistration = () => {
  if (eventDetail.value) {
    registrationStore.resetRegistrationState()
    registrationStore.setEvent(eventDetail.value)
    registrationStore.setCurrentStep(0) // Start at ticket selection
    router.push({ name: 'TicketSelection' })
  } else {
    console.error("Event details not loaded, cannot start registration.")
    // Optionally, display an error to the user
  }
}

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    // No explicit token needed if fetchEventDetails uses httpClient which handles auth for other requests
    // and this endpoint is public or optionally authenticated.
    const response = await fetchEventDetails(eventId)
    eventDetail.value = response
    // Assuming fetchEventDetails returns the event object directly (it returns response.data.data as per eventServices.js)
    console.log('Event Details Loaded in View:', JSON.parse(JSON.stringify(eventDetail.value))); // Log a deep copy
    if (eventDetail.value && eventDetail.value.eventQuestions) {
      console.log('Event Questions in View:', JSON.parse(JSON.stringify(eventDetail.value.eventQuestions)));
    } else {
      console.log('No Event Questions found in eventDetail.value in View');
    }
  } catch (err) {
    console.error("Get Event Details Error：", err)
    error.value = err.message || 'Failed to load event details.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.gmap_canvas {
  overflow: hidden;
  background: none !important;
  height: 400px;
  width: 400px;
}

p,
h4,
li,
h1 {
  font-family: "Font";
}
</style>
