<template>
  <div>
    <navbar />
    <StepIndicator
      :steps="[
        'Select Ticket',
        'Personal Info',
        'Questionnaire',
        'Review',
        'Checkout',
      ]"
      :currentStep="registrationStore.currentStep"
      @step-clicked="handleStepClick"
    />

    <div class="container mt-4" v-if="registrationStore.isEventLoaded">
      <h4 class="section-title">REVIEW YOUR REGISTRATION</h4>

      <!-- Event Details Summary -->
      <div class="card custom-card mb-4">
        <h5 class="card-header review-header">Event Details</h5>
        <div class="card-body">
          <h5 class="card-title">{{ registrationStore.eventDetails.name }}</h5>
          <p class="card-text">
            <strong>Date:</strong>
            {{ formatDate(registrationStore.eventDetails.startDateTime) }} -
            {{ formatDate(registrationStore.eventDetails.endDateTime) }} <br />
            <strong>Location:</strong>
            {{ registrationStore.eventDetails.location }} <br />
            <strong>Type:</strong>
            {{ registrationStore.eventDetails.eventType }}
          </p>
        </div>
      </div>

      <!-- Selected Tickets Summary -->
      <div
        class="card custom-card mb-4"
        v-if="
          !registrationStore.eventDetails.isFree &&
          registrationStore.selectedTickets.filter((t) => t.quantity > 0)
            .length > 0
        "
      >
        <h5 class="card-header review-header">Selected Tickets</h5>
        <ul class="list-group list-group-flush">
          <li
            v-for="ticket in registrationStore.selectedTickets.filter(
              (t) => t.quantity > 0
            )"
            :key="ticket.ticketId"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>{{ ticket.name }} (x{{ ticket.quantity }})</span>
            <span
              >AUD
              {{
                (parseFloat(ticket.price) * ticket.quantity).toFixed(2)
              }}</span
            >
          </li>
          <li
            class="list-group-item d-flex justify-content-between align-items-center fw-bold"
          >
            <span>Total Ticket Cost:</span>
            <span>AUD {{ totalCost.toFixed(2) }}</span>
          </li>
        </ul>
      </div>
      <div
        class="card custom-card mb-4"
        v-if="registrationStore.eventDetails.isFree"
      >
        <h5 class="card-header review-header">Event Type</h5>
        <div class="card-body">
          <p class="card-text">
            This is a <strong>FREE</strong> event. No payment is required.
          </p>
        </div>
      </div>

      <!-- Participants Information Summary -->
      <div
        v-for="(participant, pIndex) in registrationStore.participants"
        :key="pIndex"
        class="card custom-card mb-4"
      >
        <h5 class="card-header review-header">
          Participant #{{ pIndex + 1 }} Information
        </h5>
        <div class="card-body">
          <div class="row preview-row">
            <div class="col-md-6">
              <strong>Email:</strong> {{ participant.email }}
            </div>
            <div class="col-md-6">
              <strong>Full Name:</strong> {{ participant.firstName }}
              {{ participant.lastName }}
            </div>
            <div class="col-md-6" v-if="participant.dateOfBirth">
              <strong>Date of Birth:</strong>
              {{ formatDate(participant.dateOfBirth, false) }}
            </div>
            <div class="col-md-6" v-if="participant.phoneNumber">
              <strong>Phone:</strong> {{ participant.phoneNumber }}
            </div>
            <div class="col-md-12" v-if="participant.address">
              <strong>Address:</strong> {{ participant.address
              }}{{ participant.city ? ", " + participant.city : ""
              }}{{ participant.state ? ", " + participant.state : ""
              }}{{ participant.zipCode ? " " + participant.zipCode : ""
              }}{{ participant.country ? ", " + participant.country : "" }}
            </div>
          </div>

          <div
            v-if="
              participant.responses &&
              participant.responses.filter((r) => r.responseText).length > 0
            "
          >
            <h6 class="mt-3 review-subheader">Questionnaire Responses:</h6>
            <ul class="list-unstyled">
              <li
                v-for="response in participant.responses.filter(
                  (r) => r.responseText
                )"
                :key="response.eventQuestionId"
              >
                <strong>{{ response.questionText }}:</strong>
                <span v-if="response.questionType === 'CHECKBOX'">
                  {{ formatCheckboxResponse(response.responseText) }}
                </span>
                <span v-else>
                  {{ response.responseText }}
                </span>
              </li>
            </ul>
          </div>
          <div
            v-else-if="
              registrationStore.eventDetails.eventQuestions &&
              registrationStore.eventDetails.eventQuestions.length > 0
            "
          >
            <h6 class="mt-3 review-subheader">Questionnaire Responses:</h6>
            <p>
              <em
                >No responses provided for optional questions or no questions
                were required.</em
              >
            </p>
          </div>
        </div>
      </div>

      <div v-if="apiError" class="alert alert-danger mt-3">
        {{ apiError }}
      </div>

      <!-- Bottom operating buttons -->
      <div class="d-flex justify-content-between mt-4 mb-5">
        <div>
          <button
            class="btn btn-outline-secondary me-2"
            @click="goBackToStep('Questionnaire')"
          >
            Edit Questionnaire
          </button>
          <button
            class="btn btn-outline-secondary"
            @click="goBackToStep('PersonalInfo')"
          >
            Edit Personal Info
          </button>
        </div>
        <button
          class="btn btn-success btn-lg"
          @click="submitRegistration"
          :disabled="isSubmitting"
        >
          <span
            v-if="isSubmitting"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          {{
            isSubmitting
              ? "Submitting..."
              : registrationStore.eventDetails.isFree
              ? "Confirm Registration"
              : "Confirm & Proceed to Payment Info"
          }}
        </button>
      </div>
    </div>
    <div v-else class="container mt-5 text-center">
      <p>Loading review details or required information is missing...</p>
      <router-link
        :to="{ name: 'TicketSelection' }"
        class="btn btn-secondary mt-3"
        >Start Over</router-link
      >
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useRegistrationStore } from "@/store/registrationStore";
import { createRegistration } from "@/api/registrationServices";
import StepIndicator from "@/components/StepIndicator.vue";
import navbar from "@/components/Navbar.vue";
import { sendEmail } from "@/api/emailServices";

const router = useRouter();
const registrationStore = useRegistrationStore();

const isSubmitting = ref(false);
const apiError = ref(null);

// Define step index and route name mapping
const stepRoutes = {
  0: "TicketSelection",
  1: "PersonalInfo",
  2: "Questionnaire",
  3: "ReviewRegistration",
  4: "Checkout", // Or RegistrationPendingPayment / RegistrationSuccess
};

onMounted(() => {
  if (
    !registrationStore.isEventLoaded ||
    registrationStore.getParticipantCount === 0
  ) {
    // If essential data is missing, redirect to an earlier step
    router.push({ name: "TicketSelection" });
    return;
  }
  registrationStore.setCurrentStep(3); // This is the 'Review' step
});

const handleStepClick = (clickedStepIndex) => {
  if (clickedStepIndex < registrationStore.currentStep) {
    const routeName = stepRoutes[clickedStepIndex];
    if (routeName) {
      router.push({ name: routeName });
    } else {
      console.warn(`No route defined for step index ${clickedStepIndex}`);
    }
  }
};

const totalCost = computed(() => {
  if (registrationStore.eventDetails?.isFree) return 0;
  return registrationStore.selectedTickets.reduce((sum, ticket) => {
    return sum + parseFloat(ticket.price || 0) * ticket.quantity;
  }, 0);
});

const formatDate = (dateStr, includeTime = true) => {
  if (!dateStr) return "N/A";
  const options = { year: "numeric", month: "long", day: "numeric" };
  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }
  return new Date(dateStr).toLocaleDateString(undefined, options);
};

const formatCheckboxResponse = (responseText) => {
  try {
    const parsed = JSON.parse(responseText);
    if (Array.isArray(parsed)) {
      return parsed.join(', ');
    }
  } catch (e) {
    // Fallback if parsing fails
    console.error("Failed to parse checkbox response:", responseText, e);
  }
  return responseText; 
};

const goBackToStep = (stepName) => {
  router.push({ name: stepName });
};

const submitRegistration = async () => {
  isSubmitting.value = true;
  apiError.value = null;
  try {
    const payload = registrationStore.getRegistrationPayload();
    if (!payload) {
      apiError.value =
        "Could not prepare registration data. Please review your information.";
      isSubmitting.value = false;
      return;
    }
    console.log(
      "Submitting registration payload:",
      JSON.stringify(payload, null, 2)
    );

    const response = await createRegistration(payload);
    console.log("Registration API Response:", response);

    registrationStore.setRegistrationResult(
      response.registrationId,
      response.paymentToken
    );

    // Send Regi ID to customer email
    // For now only send to participant 1
    const emailData = {
      email: registrationStore.participants[0].email,
      registrationID: registrationStore.registrationId,
      eventName: registrationStore.eventDetails.name,
      startDateTime: formatDate(registrationStore.eventDetails.startDateTime),
      endDateTime: formatDate(registrationStore.eventDetails.endDateTime),
      location: registrationStore.eventDetails.location,
      type: registrationStore.eventDetails.eventType,
    };


    const message = sendEmail(emailData);

    if (message) {
      console.log(message);
    }

    if (registrationStore.eventDetails.isFree) {
      router.push({ name: "RegistrationSuccess" });
    } else {
      // For paid events, even if payment is deferred, we go to a pending page.
      // Later, this logic will lead to Checkout if payment is immediate.
      router.push({ name: "RegistrationPendingPayment" });
    }
    // Optionally, reset parts of the store if not needed anymore after this point,
    // or do it in the success/pending views.
    // registrationStore.resetRegistrationState(); // Or selective clear
  } catch (error) {
    console.error("Error submitting registration:", error);
    apiError.value =
      error.message ||
      error.data?.message ||
      "An unexpected error occurred during submission.";
    if (error.data?.details) {
      apiError.value += ` Details: ${JSON.stringify(error.data.details)}`;
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.custom-card {
  border-radius: 8px;
  border: 1px solid #dcdcdc;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background-color: #fff;
}
.preview-header {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.preview-row > div {
  margin-bottom: 0.5rem;
}
.section-title {
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #333;
}
.ticket-type {
  font-weight: 400;
  color: #888;
}

/* Ticket switch button area */
.ticket-tabs {
  margin-bottom: 1rem;
}
</style>
