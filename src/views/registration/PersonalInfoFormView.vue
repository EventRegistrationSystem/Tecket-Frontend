<template>
  <div>
    <navbar />
    <StepIndicator
      :steps="['Select Ticket', 'Personal Info', 'Questionnaire', 'Review', 'Checkout']"
      :currentStep="registrationStore.currentStep"
      @step-clicked="handleStepClick"
    />

    <div class="container mt-4">
      <h4 class="section-title">PARTICIPANT INFORMATION</h4>

      <div v-if="!registrationStore.isEventLoaded || registrationStore.getParticipantCount === 0" class="text-center">
        <p>Please select tickets first.</p>
        <router-link :to="{ name: 'TicketSelection' }" class="btn btn-secondary">Back to Ticket Selection</router-link>
      </div>

      <div v-else class="personalInfo">
        <!-- Participant Tabs -->
        <div class="ticket-tabs mb-3">
          <button
            v-for="(_, index) in registrationStore.participants"
            :key="index"
            @click="currentParticipantIndex = index"
            :class="['btn', currentParticipantIndex === index ? 'btn-primary' : 'btn-outline-secondary', 'me-2']"
          >
            Participant #{{ index + 1 }}
            <span v-if="!isParticipantInfoComplete(registrationStore.participants[index])" class="incomplete-badge">!</span>
          </button>
        </div>

        <form @submit.prevent="goToNextStep" v-if="currentParticipant">
          <div class="card custom-card">
            <h5 class="card-title">
              Details for Participant #{{ currentParticipantIndex + 1 }}
            </h5>

            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Email <span class="text-danger">*</span></label>
                <input type="email" class="form-control" v-model="currentParticipant.email" required />
                <!-- Basic validation example, can be expanded -->
                <small v-if="formErrors[currentParticipantIndex]?.email" class="text-danger">
                  {{ formErrors[currentParticipantIndex]?.email }}
                </small>
              </div>
            </div>
            <div class="row g-3 mt-3">
              <div class="col-md-6">
                <label class="form-label">First Name <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="currentParticipant.firstName" required />
                <small v-if="formErrors[currentParticipantIndex]?.firstName" class="text-danger">
                  {{ formErrors[currentParticipantIndex]?.firstName }}
                </small>
              </div>
              <div class="col-md-6">
                <label class="form-label">Last Name <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="currentParticipant.lastName" required />
                <small v-if="formErrors[currentParticipantIndex]?.lastName" class="text-danger">
                  {{ formErrors[currentParticipantIndex]?.lastName }}
                </small>
              </div>
            </div>

            <div class="row g-3 mt-3">
              <div class="col-md-6">
                <label class="form-label">Phone Number</label>
                <input type="tel" class="form-control" v-model="currentParticipant.phoneNumber" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Date of Birth</label>
                <input type="date" class="form-control" v-model="currentParticipant.dateOfBirth" />
              </div>
            </div>

            <div class="row g-3 mt-3">
              <div class="col-md-12">
                <label class="form-label">Address</label>
                <input type="text" class="form-control" placeholder="Street Address" v-model="currentParticipant.address" />
              </div>
            </div>
            <div class="row g-3 mt-1">
              <div class="col-md-4">
                <label class="form-label">City</label>
                <input type="text" class="form-control" v-model="currentParticipant.city" />
              </div>
              <div class="col-md-4">
                <label class="form-label">State/Province</label>
                <input type="text" class="form-control" v-model="currentParticipant.state" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Zip/Postal Code</label>
                <input type="text" class="form-control" v-model="currentParticipant.zipCode" />
              </div>
            </div>
             <div class="row g-3 mt-1">
              <div class="col-md-6">
                <label class="form-label">Country</label>
                <select class="form-select" v-model="currentParticipant.country">
                  <option value="">Select Country (Optional)</option>
                  <option>United States</option>
                  <option>Australia</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>China</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-between mt-4 mb-5">
            <button type="button" class="btn btn-outline-secondary" @click="goBackToTicketSelection">Back to Tickets</button>
            <button class="btn btn-primary" type="submit">
              {{ isLastParticipant ? 'Next: Questionnaire' : 'Save & Next Participant' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRegistrationStore } from '@/store/registrationStore'
import StepIndicator from '@/components/StepIndicator.vue'
import navbar from '@/components/Navbar.vue'

const router = useRouter()
const registrationStore = useRegistrationStore()

const currentParticipantIndex = ref(0)
// Reactive errors object, keys are participant indices
const formErrors = ref({})


// Define step index and route name mapping
const stepRoutes = {
  0: 'TicketSelection',
  1: 'PersonalInfo',
  2: 'Questionnaire',
  3: 'ReviewRegistration', // Updated name
  4: 'Checkout'
}

onMounted(() => {
  if (!registrationStore.isEventLoaded || registrationStore.getParticipantCount === 0) {
    // If no participants (e.g. user navigated directly or refreshed), redirect to ticket selection
    router.push({ name: 'TicketSelection' });
    return;
  }
  registrationStore.setCurrentStep(1); // This is the 'Personal Info' step

  // Initialize errors for all participants
  registrationStore.participants.forEach((_, index) => {
    formErrors.value[index] = {};
  });
})

const currentParticipant = computed(() => {
  return registrationStore.participants[currentParticipantIndex.value]
})

const isLastParticipant = computed(() => {
  return currentParticipantIndex.value === registrationStore.getParticipantCount - 1
})

// Watch for changes in currentParticipant and update the store
// This provides a basic auto-save per field change for the current participant.
// For more complex scenarios, you might save on blur or with a dedicated save button per participant.
watch(currentParticipant, (newData) => {
  if (newData) {
    registrationStore.updateParticipantInfo(currentParticipantIndex.value, newData)
  }
}, { deep: true })


const handleStepClick = (clickedStepIndex) => {
  if (clickedStepIndex < registrationStore.currentStep) {
    // Before navigating back, ensure current form is valid or prompt user
    if (validateCurrentParticipantForm()) {
      const routeName = stepRoutes[clickedStepIndex]
      if (routeName) {
        router.push({ name: routeName })
      }
    } else {
      alert('Please correct the errors on the current participant form before navigating.')
    }
  }
}

const isParticipantInfoComplete = (participant) => {
  // Basic check for required fields for the badge
  return participant && participant.email?.trim() && participant.firstName?.trim() && participant.lastName?.trim();
}

const goBackToTicketSelection = () => {
  router.push({ name: 'TicketSelection' })
}

const validateCurrentParticipantForm = () => {
  let isValid = true;
  const errors = {};
  const participant = currentParticipant.value;

  if (!participant.email?.trim()) {
    errors.email = 'Email is required.';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participant.email.trim())) {
    errors.email = 'Invalid email format.';
    isValid = false;
  }

  if (!participant.firstName?.trim()) {
    errors.firstName = 'First name is required.';
    isValid = false;
  }
  if (!participant.lastName?.trim()) {
    errors.lastName = 'Last name is required.';
    isValid = false;
  }
  // Add more validation as needed for other fields (phone, DOB, address parts)

  formErrors.value[currentParticipantIndex.value] = errors;
  return isValid;
}

const validateAllParticipantForms = () => {
  let allValid = true;
  for (let i = 0; i < registrationStore.getParticipantCount; i++) {
    // Temporarily switch to validate each form (or adapt validateCurrentParticipantForm)
    const participantToValidate = registrationStore.participants[i];
    const errors = {};
    if (!participantToValidate.email?.trim()) {
        errors.email = 'Email is required.'; allValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participantToValidate.email.trim())) {
        errors.email = 'Invalid email format.'; allValid = false;
    }
    if (!participantToValidate.firstName?.trim()) {
        errors.firstName = 'First name is required.'; allValid = false;
    }
    if (!participantToValidate.lastName?.trim()) {
        errors.lastName = 'Last name is required.'; allValid = false;
    }
    formErrors.value[i] = errors; // Store errors for display if needed
  }
  return allValid;
}


const goToNextStep = () => {
  if (!validateCurrentParticipantForm()) {
    alert('Please correct the errors for the current participant.');
    return;
  }

  if (isLastParticipant.value) {
    // Before proceeding to questionnaire, validate ALL participant forms
    if (validateAllParticipantForms()) {
      registrationStore.setCurrentStep(2); // Move to 'Questionnaire'
      router.push({ name: 'Questionnaire' });
    } else {
      alert('Please ensure all participant forms are correctly filled out. Check tabs with "!" for errors.');
      // Find the first participant with errors and switch to their tab
      for (let i = 0; i < registrationStore.getParticipantCount; i++) {
        if (Object.keys(formErrors.value[i] || {}).length > 0) {
          currentParticipantIndex.value = i;
          break;
        }
      }
    }
  } else {
    currentParticipantIndex.value++;
  }
}

</script>

<style scoped>
.custom-card {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background-color: #fff;
}
.section-title {
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #333;
}
.card-title {
  font-weight: 700;
  margin-bottom: 1rem;
  color: #555;
}
.text-danger {
  font-size: 0.875rem;
}
.upload-status {
  margin-top: 0.5rem;
  color: #28a745;
}
.ticket-tabs {
  margin-bottom: 1rem;
}
.incomplete-badge {
  color: red;
  margin-left: 5px;
  font-weight: bold;
}

/* Added margin-bottom to the personalInfo container */
.personalInfo {
  margin-bottom: 2.5rem;
}
</style>
