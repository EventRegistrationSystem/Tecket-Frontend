<template>
  <div>
    <navbar />
    <div class="container mt-5 text-center">
      <div v-if="registrationStore.registrationId">
        <h1 class="display-4 text-info">Registration Pending Payment</h1>
        <p class="lead">Your registration for <strong>{{ registrationStore.eventDetails?.name }}</strong> has been received and is awaiting payment.</p>
        <p>Your Registration ID is: <strong>{{ registrationStore.registrationId }}</strong>.</p>
        <p v-if="registrationStore.paymentToken">Please keep this payment token secure if you need to resume payment later: <strong>{{ registrationStore.paymentToken }}</strong></p>
        <p class="mt-4">Payment processing will be implemented in a future update. For now, your registration is saved with a pending status.</p>
        <div class="mt-4">
          <!-- <button @click="proceedToPayment" class="btn btn-success me-2">Proceed to Payment (Coming Soon)</button> -->
          <router-link to="/events" class="btn btn-primary me-2">Browse More Events</router-link>
          <router-link :to="{ name: 'Home' }" class="btn btn-secondary">Go to Homepage</router-link>
        </div>
      </div>
      <div v-else>
        <h1 class="display-4 text-warning">Information Missing</h1>
        <p class="lead">It seems you've landed here without a pending registration.</p>
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
// import { useRouter } from 'vue-router';

const registrationStore = useRegistrationStore();
// const router = useRouter();

onMounted(() => {
  console.log("Registration pending payment view mounted. Registration ID:", registrationStore.registrationId);
  // If paymentToken exists, it's a guest checkout for a paid event.
});

/*
const proceedToPayment = () => {
  // This will eventually navigate to the Checkout view
  // For now, it's disabled.
  if (registrationStore.registrationId) {
    // router.push({ name: 'Checkout' }); // Or the appropriate route for payment
    alert("Payment functionality is coming soon!");
  }
};
*/
</script>

<style scoped>
/* Add any specific styles for this page */
.display-4 {
  margin-bottom: 0.5em;
}
</style>
