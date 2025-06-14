<template>
  <navbar />
  <div class="card text-bg-light">
    <img
      src="../assets/img1Home.jpg"
      alt="img"
      class="card-img"
      style="object-fit: fill; height: 40vh"
    />
    <div class="card-img-overlay ms-5">
      <h2
        class="card-title text-light fs-1 fw-bold ms-5"
        style="font-family: 'Font'"
      >
        Hello folks!<br />
        Welcome to Teket!
      </h2>
      
      <p class="card-text text-light fs-4 ms-5" style="font-family: 'Font'">
        Tickets are available here<br />
        for anyone with supper low price!
      </p>
      <br />
      <router-link to="/events">
        <button
          type="button"
          class="btn btn-warning ms-5 fs-4 mb-2"
          style="font-family: 'Font'"
        >
          View our events
        </button>
      </router-link>
    </div>
  </div>
  <div>
    <h4 style="font-family: 'Font'" class="fw-bold pt-5 ms-5">
      Upcoming Events
    </h4>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center mt-5">
      <p>Loading events...</p>
      <!-- Spinner -->
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger mt-5 mx-5" role="alert">
      {{ error }}
    </div>
    
    <!-- Events Display -->
    <div v-else-if="events && events.length > 0" class="container mt-5">
      <div class="row">
        <div v-for="event in events" :key="event.id" class="col-md-4 mb-4">
          <div class="card h-100">
            <img :src="event.imageUrl || 'https://placehold.co/300x200?text=Event+Image'" class="card-img-top" alt="Event Image" style="height: 200px; object-fit: cover;">
            <div class="card-body">
              <h5 class="card-title">{{ event.name }}</h5>
              <p class="card-text">{{ event.description ? event.description.substring(0, 100) + (event.description.length > 100 ? '...' : '') : 'No description available.' }}</p>
              <router-link :to="'/eventDetail/' + event.id" class="btn btn-primary">View Details</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Events State (after attempting to load) -->
    <h5
      v-else
      style="font-family: 'Font'"
      class="fw-bold mt-5 ps-5 text-body-tertiary"
    >
      No upcoming events at the moment.
    </h5>

    <div class="container text-center mt-4">
      <router-link to="/events">
        <button
          type="button"
          class="btn fw-semibold btn-lg align-self-center"
          style="font-family: 'Font'; background-color: #edece8"
        >
          See all events
        </button>
      </router-link>
    </div>
  </div>

  <div class="align-item-center pt-4 text-center">
    <h1>For organisations</h1>
    <h5 class="text-muted">
      Teket is an event retail platform. Get in touch to find out more.
    </h5>
    <div
      style="display: flex"
      class="mt-4 justify-content-center align-items-center"
    >
      <img alt="ava" src="../assets/avatar.jpg" />
      <div class="text-start">
        <h3 class="fw-bold text-warning">Mason Mount</h3>
        <h5 class="text-muted mb-4">Co-founder</h5>
        <div style="display: flex" class="mt-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-mail h-5 w-5"
          >
            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </svg>
          <p class="ms-2">abcd@gmail.com</p>
        </div>
        <div style="display: flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-phone h-5 w-5"
          >
            <path
              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
            ></path>
          </svg>
          <p class="ms-2">0433990388</p>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import { fetchEvents } from '@/api/eventServices.js';

const events = ref([]);
const isLoading = ref(false);
const error = ref(null);

onMounted(async () => {
  isLoading.value = true;
  try {
    const response = await fetchEvents({ limit: 3 }, { isPublicView: true });
    events.value = response.events;
  } catch (err) {
    error.value = 'Failed to load events.';
    console.error('Error fetching events for homepage:', err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
h.p {
  font-family: "Font";
}
</style>
