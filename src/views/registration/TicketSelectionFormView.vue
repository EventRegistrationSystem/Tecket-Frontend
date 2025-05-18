<template>
  <div>
    <navbar />

    <StepIndicator
      :steps="['Select Ticket', 'Personal Info', 'Questionnaire', 'Review', 'Checkout']"
      :currentStep="registrationStore.currentStep"
      @step-clicked="handleStepClick"
    />

    <div class="container mt-5" v-if="registrationStore.isEventLoaded">
      <h2 class="fw-bold mb-4">{{ registrationStore.eventDetails.name }}</h2>

      <div v-if="!registrationStore.eventDetails.tickets || registrationStore.eventDetails.tickets.length === 0">
        <p v-if="registrationStore.eventDetails.isFree">This is a free event. Proceed to the next step to enter your details.</p>
        <p v-else>No tickets currently available for this event.</p>
      </div>

      <div v-else class="mb-5">
        <div v-for="ticket in registrationStore.selectedTickets" :key="ticket.ticketId" class="d-flex justify-content-between align-items-start border-bottom py-3">
          <div>
            <p class="fw-bold mb-1">{{ ticket.name }}</p>
            <p class="mb-0 text-secondary small">
              Sales: {{ formatDate(ticket.salesStart) }} - {{ formatDate(ticket.salesEnd) }} <br />
              Status: {{ ticket.status }} | Available: {{ ticket.quantityTotal - ticket.quantitySold }}
            </p>
          </div>
          <div class="d-flex align-items-center">
            <span v-if="!registrationStore.eventDetails.isFree" class="me-2 text-primary fw-bold">AUD {{ parseFloat(ticket.price).toFixed(2) }}</span>
            <span v-else class="me-2 text-primary fw-bold">FREE</span>
            <button class="btn btn-outline-secondary btn-sm" @click="decrementQuantity(ticket.ticketId)">-</button>
            <input
              type="number"
              :value="ticket.quantity"
              @input="updateQuantity(ticket.ticketId, parseInt($event.target.value))"
              min="0"
              :max="ticket.quantityTotal - ticket.quantitySold"
              class="form-control text-center mx-2"
              style="width: 70px;"
            />
            <button class="btn btn-outline-secondary btn-sm" @click="incrementQuantity(ticket.ticketId)">+</button>
          </div>
        </div>
      </div>

      <!-- Submit button -->
      <div class="text-end mb-5">
        <button
          class="btn btn-primary px-4"
          :disabled="!canProceed"
          @click="nextStep"
        >
          Next step
        </button>
      </div>
    </div>
    <div v-else class="container mt-5 text-center">
      <p>Loading event details or event not found...</p>
      <router-link to="/events" class="btn btn-secondary mt-3">Back to Events</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRegistrationStore } from '@/store/registrationStore'
import StepIndicator from '@/components/StepIndicator.vue'
import navbar from '@/components/Navbar.vue'

const router = useRouter()
const registrationStore = useRegistrationStore()

// Define the mapping of step indexes and route names
const stepRoutes = {
  0: 'TicketSelection',
  1: 'PersonalInfo',
  2: 'Questionnaire',
  3: 'Review',
  4: 'Checkout' // We will adjust navigation later to skip this if not paid
}

// Ensure the current step in the store is accurate when the component mounts
onMounted(() => {
  if (!registrationStore.isEventLoaded && registrationStore.eventId) {
    // Potentially redirect or show error if event details are not loaded but an eventId exists
    // This scenario should ideally be handled by EventDetailsView setting the store correctly.
    console.warn('TicketSelectionFormView mounted without event details in store. Event ID:', registrationStore.eventId)
    // router.push({ name: 'EventDetails', params: { id: registrationStore.eventId } }); // Or redirect to events list
    // For now, we assume EventDetailsView has populated the store.
  }
  registrationStore.setCurrentStep(0) // This is the 'Select Ticket' step
})

const handleStepClick = (clickedStepIndex) => {
  // Allow navigation only to previously completed steps or current step
  if (clickedStepIndex < registrationStore.currentStep) {
    const routeName = stepRoutes[clickedStepIndex]
    if (routeName) {
      router.push({ name: routeName })
    } else {
      console.warn(`No route name found for step index ${clickedStepIndex}`)
    }
  }
}

const incrementQuantity = (ticketId) => {
  const ticket = registrationStore.selectedTickets.find(t => t.ticketId === ticketId)
  if (ticket && ticket.quantity < (ticket.quantityTotal - ticket.quantitySold)) {
    registrationStore.updateTicketQuantity(ticketId, ticket.quantity + 1)
  }
}

const decrementQuantity = (ticketId) => {
  const ticket = registrationStore.selectedTickets.find(t => t.ticketId === ticketId)
  if (ticket && ticket.quantity > 0) {
    registrationStore.updateTicketQuantity(ticketId, ticket.quantity - 1)
  }
}

const updateQuantity = (ticketId, quantity) => {
  const ticket = registrationStore.selectedTickets.find(t => t.ticketId === ticketId)
  if (ticket) {
    const maxQuantity = ticket.quantityTotal - ticket.quantitySold
    const newQuantity = Math.max(0, Math.min(quantity, maxQuantity))
    registrationStore.updateTicketQuantity(ticketId, newQuantity)
  }
}

const canProceed = computed(() => {
  if (registrationStore.eventDetails && registrationStore.eventDetails.isFree) {
    return true // For free events, can always proceed to enter details (1 registration assumed)
  }
  return registrationStore.totalSelectedTickets > 0
})

const nextStep = () => {
  if (!canProceed.value) return

  // The initializeParticipants action in the store is already called when ticket quantities change.
  // So, participants array should be correctly sized.
  registrationStore.setCurrentStep(1) // Move to 'Personal Info'
  router.push({ name: 'PersonalInfo' }) // Ensure this route name is correct
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString() // Or toLocaleString for date and time
}

</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid #ddd !important;
}
input[type="number"] {
  -moz-appearance: textfield;
}
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
