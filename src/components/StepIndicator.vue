<template>
  <div class="step-indicator">
    <div class="steps-container">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="step"
        :class="{ active: index === currentStep }"
        @click="onStepClick(index)"
      >
        <span class="step-number">{{ index + 1 }}</span>
        <span class="step-label">{{ step }}</span>
      </div>
    </div>
    <button @click="cancelRegistration" class="btn btn-sm btn-outline-danger cancel-button">
      Cancel
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import { useRouter } from 'vue-router';
import { useRegistrationStore } from '@/store/registrationStore';

const props = defineProps({
  steps: {
    type: Array,
    required: true,
  },
  currentStep: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["step-clicked"]);
const router = useRouter();
const registrationStore = useRegistrationStore();

/**
 * Sends an event to the parent component when a step is clicked
 * @param {Number} index Index of clicked steps
 */
const onStepClick = (index) => {
  emit("step-clicked", index);
};

const cancelRegistration = () => {
  if (confirm('Are you sure you want to cancel this registration and lose all progress?')) {
    const eventId = registrationStore.eventId;
    registrationStore.resetRegistrationState();
    if (eventId) {
      // Navigate back to the specific event's detail page
      router.push({ name: 'EventDetail', params: { id: eventId } });
    } else {
      // Fallback if eventId is not available in the store for some reason
      router.push({ name: 'EventList' }); 
    }
  }
};
</script>

<style scoped>
.step-indicator {
  display: flex;
  /* PUsh steps in the middle and cancel button to the right */

  justify-content: space-between; /* Space between steps and button */ 
  align-items: center; /* Vertically align items */
  gap: 20px;
  padding: 10px 20px; /* Add some padding for the button */
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6; /* Optional: add a border like before */
}

.steps-container {
  display: flex;
  justify-content: flex-start; /* Align steps to the start */
  gap: 15px; /* Gap between steps */
}

.step {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 15px;
  border-radius: 20px;
  background-color: #ddd;
  cursor: pointer;
}

.step.active {
  background-color: #ffc107;
  font-weight: bold;
}

.step-number {
  font-size: 14px;
  font-weight: bold;
}

.step-label {
  font-size: 14px;
}
</style>
