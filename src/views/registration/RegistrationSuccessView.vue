<template>
  <div>
    <navbar />
    <div class="container mt-5 text-center">
      <div v-if="registrationStore.registrationId">
        <h1 class="display-4 text-success">Registration Successful!</h1>
        <p class="lead">Thank you for registering for the event: <strong>{{ registrationStore.eventDetails?.name }}</strong>.</p>
        <p>Your Registration ID is: <strong>{{ registrationStore.registrationId }}</strong>.</p>
        <p>A confirmation has been sent to your email (if provided).</p>
        <router-link to="/events" class="btn btn-primary mt-3 me-2">Browse More Events</router-link>
        <router-link :to="{ name: 'Home' }" class="btn btn-secondary mt-3">Go to Homepage</router-link>
      </div>
      <div v-else>
        <h1 class="display-4 text-warning">Almost there...</h1>
        <p class="lead">It seems you've landed here without completing a registration.</p>
        <p>Please start by finding an event and registering.</p>
        <router-link to="/events" class="btn btn-primary mt-3">Find Events</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRegistrationStore } from '@/store/registrationStore';
import navbar from '@/components/Navbar.vue';

const registrationStore = useRegistrationStore();

onMounted(() => {
  // Optionally, you could clear parts of the registration store here if it's a one-time success page
  // For example, if you don't want the user to accidentally re-submit or see old data if they navigate back.
  // However, keeping eventDetails might be useful for display.
  // registrationStore.setCurrentStep(SOME_COMPLETED_STEP_INDICATOR); // Or reset fully after a delay
  console.log("Registration success view mounted. Registration ID:", registrationStore.registrationId);
});
</script>

<style scoped>
/* Add any specific styles for this page */
.display-4 {
  margin-bottom: 0.5em;
}
</style>
