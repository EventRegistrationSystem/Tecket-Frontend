<template>
  <div>
    <navbar />
    <StepIndicator
      :steps="['Select Ticket', 'Personal Info', 'Questionnaire', 'Review', 'Checkout']"
      :currentStep="registrationStore.currentStep"
      @step-clicked="handleStepClick"
    />

    <div class="container mt-4">
      <h4 class="section-title">EVENT QUESTIONNAIRE</h4>

      <div v-if="!registrationStore.isEventLoaded || registrationStore.getParticipantCount === 0" class="text-center">
        <p>Please complete previous steps first.</p>
        <router-link :to="{ name: 'TicketSelection' }" class="btn btn-secondary">Back to Ticket Selection</router-link>
      </div>
      
      <div v-else-if="!eventQuestions || eventQuestions.length === 0" class="text-center">
        <p>No questionnaire for this event. You can proceed to the next step.</p>
         <div class="d-flex justify-content-between mt-4 mb-5">
            <button type="button" class="btn btn-outline-secondary" @click="goBackToPersonalInfo">Back to Personal Info</button>
            <button class="btn btn-primary" @click="goToNextStep">Next: Review</button>
          </div>
      </div>

      <div v-else class="questionnaire-content">
        <!-- Participant Tabs -->
        <div class="ticket-tabs mb-3">
          <button
            v-for="(_, index) in registrationStore.participants"
            :key="index"
            @click="currentParticipantIndex = index"
            :class="['btn', currentParticipantIndex === index ? 'btn-primary' : 'btn-outline-secondary', 'me-2']"
          >
            Participant #{{ index + 1 }}
            <span v-if="!areParticipantQuestionsComplete(registrationStore.participants[index])" class="incomplete-badge">!</span>
          </button>
        </div>

        <form @submit.prevent="goToNextStep" v-if="currentParticipant && eventQuestions.length > 0">
          <div class="card custom-card">
            <h5 class="card-title">
              Questions for Participant #{{ currentParticipantIndex + 1 }}
              ({{ currentParticipant.firstName }} {{ currentParticipant.lastName }})
            </h5>
            
            <div v-for="(question, qIndex) in eventQuestions" :key="question.id" class="mb-3">
              <!-- Debug log for each question -->
              <!-- {{ console.log(`Rendering Q: ${question.question.questionText}, Type: ${question.question.questionType}, Rules:`, question.question.validationRules) }} -->
              <label :for="`question-${currentParticipantIndex}-${qIndex}`" class="form-label">
                {{ question.question.questionText }}
                <span v-if="question.isRequired" class="text-danger">*</span>
              </label>
              
              <!-- TEXT Input -->
              <input 
                v-if="question.question.questionType === 'TEXT'"
                type="text"
                class="form-control"
                :id="`question-${currentParticipantIndex}-${qIndex}`"
                :value="getParticipantResponse(question.id)"
                @input="updateResponse(question.id, $event.target.value)"
                :required="question.isRequired"
              />

              <!-- DROPDOWN Input -->
              <select
                v-else-if="question.question.questionType === 'DROPDOWN' && question.question.options && question.question.options.length > 0"
                class="form-select"
                :id="`question-${currentParticipantIndex}-${qIndex}`"
                :value="getParticipantResponse(question.id)"
                @change="updateResponse(question.id, $event.target.value)"
                :required="question.isRequired"
              >
                <option value="" disabled>Select an option</option>
                <option v-for="optionObj in question.question.options" :key="optionObj.id || optionObj.optionText" :value="optionObj.optionText">
                  {{ optionObj.optionText }}
                </option>
              </select>
              
              <!-- CHECKBOX Input (Example, assuming backend sends 'CHECKBOX' type and options) -->
              <!-- This part is for future extension if CHECKBOX type is fully supported with options -->
              <div v-else-if="question.question.questionType === 'CHECKBOX' && question.question.options && question.question.options.length > 0">
                <div v-for="optionObj in question.question.options" :key="optionObj.id || optionObj.optionText" class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :value="optionObj.optionText"
                    :id="`question-${currentParticipantIndex}-${qIndex}-${optionObj.id || optionObj.optionText}`"
                    @change="updateCheckboxResponse(question.id, optionObj.optionText, $event.target.checked)"
                    :checked="getParticipantResponse(question.id)?.includes(optionObj.optionText)"
                    :required="question.isRequired && !getParticipantResponse(question.id)?.length" 
                  />
                  <label class="form-check-label" :for="`question-${currentParticipantIndex}-${qIndex}-${optionObj.id || optionObj.optionText}`">
                    {{ optionObj.optionText }}
                  </label>
                </div>
              </div>

              <!-- Fallback to TEXT input if type is not recognized or options are missing for choice types -->
              <input
                v-else-if="question.question.questionType !== 'DROPDOWN' && question.question.questionType !== 'CHECKBOX'"
                type="text"
                class="form-control"
                :id="`question-${currentParticipantIndex}-${qIndex}-fallback`"
                :value="getParticipantResponse(question.id)"
                @input="updateResponse(question.id, $event.target.value)"
                :required="question.isRequired"
                placeholder="Enter your answer"
              />
              
              <small v-if="formErrors[currentParticipantIndex]?.[question.id]" class="text-danger">
                {{ formErrors[currentParticipantIndex][question.id] }}
              </small>
            </div>
          </div>

          <div class="d-flex justify-content-between mt-4 mb-5">
            <button type="button" class="btn btn-outline-secondary" @click="goBackToPersonalInfo">Back to Personal Info</button>
            <button class="btn btn-primary" type="submit">
              {{ isLastParticipant ? 'Next: Review' : 'Save & Next Participant' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRegistrationStore } from '@/store/registrationStore'
import StepIndicator from '@/components/StepIndicator.vue'
import navbar from '@/components/Navbar.vue'

const router = useRouter()
const registrationStore = useRegistrationStore()

const currentParticipantIndex = ref(0)
const formErrors = ref({}) // To store validation errors, e.g., formErrors[participantIndex][questionId]

// Define step index and route name mapping
const stepRoutes = {
  0: 'TicketSelection',
  1: 'PersonalInfo',
  2: 'Questionnaire',
  3: 'ReviewRegistration',
  4: 'Checkout'
}

onMounted(() => {
  if (!registrationStore.isEventLoaded || registrationStore.getParticipantCount === 0) {
    router.push({ name: 'PersonalInfo' }); // Or TicketSelection if personal info also relies on it
    return;
  }
  registrationStore.setCurrentStep(2); // This is the 'Questionnaire' step

  // Initialize formErrors structure
  registrationStore.participants.forEach((_, pIndex) => {
    formErrors.value[pIndex] = {};
  });
})

const eventQuestions = computed(() => registrationStore.eventDetails?.eventQuestions || [])

const currentParticipant = computed(() => {
  return registrationStore.participants[currentParticipantIndex.value]
})

const isLastParticipant = computed(() => {
  return currentParticipantIndex.value === registrationStore.getParticipantCount - 1
})

const getParticipantResponse = (eventQuestionId) => {
  const participant = currentParticipant.value;
  if (participant && participant.responses) {
    const response = participant.responses.find(r => r.eventQuestionId === eventQuestionId);
    return response ? response.responseText : '';
  }
  return '';
}

const updateResponse = (eventQuestionId, value) => {
  registrationStore.updateParticipantResponse(currentParticipantIndex.value, eventQuestionId, value);
  // Clear specific error for this question on input
  if (formErrors.value[currentParticipantIndex.value]?.[eventQuestionId]) {
     delete formErrors.value[currentParticipantIndex.value][eventQuestionId];
  }
}


const handleStepClick = (clickedStepIndex) => {
  if (clickedStepIndex < registrationStore.currentStep) {
     if (validateCurrentParticipantQuestions()) { // Validate before navigating back
        const routeName = stepRoutes[clickedStepIndex]
        if (routeName) {
            router.push({ name: routeName })
        }
     } else {
        alert('Please ensure all required questions for the current participant are answered.');
     }
  }
}

const areParticipantQuestionsComplete = (participant) => {
  if (!eventQuestions.value || eventQuestions.value.length === 0) return true; // No questions to complete
  if (!participant || !participant.responses) return false;

  return eventQuestions.value.every(q => {
    if (!q.isRequired) return true;
    const response = participant.responses.find(r => r.eventQuestionId === q.id);
    return response && response.responseText?.trim() !== '';
  });
}

const goBackToPersonalInfo = () => {
  router.push({ name: 'PersonalInfo' })
}

const validateCurrentParticipantQuestions = () => {
  let isValid = true;
  const errors = {};
  const participant = currentParticipant.value;

  if (!participant || !eventQuestions.value) return true; // Should not happen if checks are in place

  eventQuestions.value.forEach(question => {
    if (question.isRequired) {
      const response = participant.responses.find(r => r.eventQuestionId === question.id);
      if (!response || !response.responseText?.trim()) {
        errors[question.id] = `${question.question.questionText} is required.`;
        isValid = false;
      }
    }
  });
  formErrors.value[currentParticipantIndex.value] = errors;
  return isValid;
}

const validateAllParticipantsQuestions = () => {
  let allValid = true;
  for (let i = 0; i < registrationStore.getParticipantCount; i++) {
    const participant = registrationStore.participants[i];
    const errors = {};
     eventQuestions.value.forEach(question => {
        if (question.isRequired) {
            const response = participant.responses.find(r => r.eventQuestionId === question.id);
            if (!response || !response.responseText?.trim()) {
                errors[question.id] = `${question.question.questionText} is required.`;
                allValid = false;
            }
        }
    });
    formErrors.value[i] = errors;
  }
  return allValid;
}

const goToNextStep = () => {
  if (!validateCurrentParticipantQuestions()) {
    alert('Please answer all required questions for the current participant.');
    return;
  }

  if (isLastParticipant.value) {
    if (validateAllParticipantsQuestions()) {
      registrationStore.setCurrentStep(3); // Move to 'Review'
      router.push({ name: 'ReviewRegistration' });
    } else {
      alert('Please ensure all required questions for all participants are answered. Check tabs with "!" for errors.');
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
.ticket-tabs {
  margin-bottom: 1rem;
}

.incomplete-badge {
  color: red;
  margin-left: 5px;
  font-weight: bold;
}
</style>
