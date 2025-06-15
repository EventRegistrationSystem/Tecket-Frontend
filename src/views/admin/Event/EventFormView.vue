<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminLayout from "@/views/admin/AdminLayout.vue";

// Importing API services
import {
  fetchEventDetails,
  createEvent,
  updateEvent,
} from "@/api/eventServices.js";
import {
  fetchTicketsForEvent,
  createTicketForEvent,
  updateTicketForEvent,
  deleteTicketForEvent,
} from "@/api/ticketServices.js";
import {
  fetchEventQuestions,
  createEventQuestion,
  updateEventQuestion,
  deleteEventQuestion,
} from "@/api/questionServices.js";

// Import components and utilities
import EventBasicInfo from "./components/EventBasicInfo.vue";
import EventTickets from "./components/EventTickets.vue";
import EventQuestionnaire from "./components/EventQuestionnaire.vue";
import {
  parseDate,
  parseTime,
  combineDateAndTime,
  getDefaultFormState
} from "./utils/eventFormUtils.js";
import { validateEventForm, scrollToFirstError } from "./utils/eventFormValidation.js";

const route = useRoute();
const router = useRouter();

// Determine if you are in edit mode (routes containing '/edit/' are in edit mode)
const isEditMode = computed(() => route.path.includes("/edit/"));
const eventId = isEditMode.value ? parseInt(route.params.id) : null;

// Define states such as loading, saving, etc.
const loading = ref(true);
const saving = ref(false);
const activeTab = ref("basic");
const questions = ref([]);

// form status, fields are initialised by default in create mode
// Split the original date field into startDate and endDate.
const eventForm = ref({
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  location: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  organizer: "",
  capacity: 100,
  imageUrl: "",
  eventType: "",
  isFree: false,
});

// Ticket data (taken from interface when editing, default empty array when creating)
const ticketTypes = ref([]);

// Error messages for form validation
const errors = ref({});

const originalTicketTypes = ref([]);
const originalQuestions = ref([]);

onMounted(async () => {
  // Check for tab query parameter and set activeTab
  const tabFromQuery = route.query.tab;
  if (
    tabFromQuery &&
    ["basic", "tickets", "questionnaire"].includes(tabFromQuery)
  ) {
    activeTab.value = tabFromQuery;
  }

  if (isEditMode.value) {
    try {
      loading.value = true;
      // Getting event details from the API
      const eventData = await fetchEventDetails(eventId);
      if (eventData) {
        // Populate the eventForm to convert the startDateTime and endDateTime returned by the API to extract the date and time, respectively.
        eventForm.value = {
          name: eventData.name || "",
          description: eventData.description || "",
          startDate: parseDate(eventData.startDateTime),
          endDate: parseDate(eventData.endDateTime),
          startTime: parseTime(eventData.startDateTime),
          endTime: parseTime(eventData.endDateTime),
          location: eventData.location || "",
          address: eventData.address || "",
          city: eventData.city || "",
          state: eventData.state || "",
          zipCode: eventData.zipCode || "",
          organizer:
            typeof eventData.organizer === "object" &&
              eventData.organizer !== null
              ? `${eventData.organizer.firstName} ${eventData.organizer.lastName}`
              : eventData.organizer || "",

          capacity: eventData.capacity || 100,
          eventType: eventData.eventType || "",
          isFree: eventData.isFree || false,
        };

        const fetchedTickets = await fetchTicketsForEvent(eventId);
        ticketTypes.value = fetchedTickets.map((t) => ({
          id: t.id,
          name: t.name || "",
          price: t.price !== undefined ? Number(t.price) : 0,
          quantity: t.quantityTotal || 0,
          description: t.description || "",
          salesStart: t.salesStart ? parseDate(t.salesStart) : "",
          salesEnd: t.salesEnd ? parseDate(t.salesEnd) : "",
        }));
        originalTicketTypes.value = JSON.parse(
          JSON.stringify(ticketTypes.value)
        );

        const fetchedQuestions = await fetchEventQuestions(eventId);
        questions.value = fetchedQuestions.map((q) => {
          let frontendQuestionType = (
            q.question.questionType || "text"
          ).toLowerCase();
          if (frontendQuestionType === "dropdown") {
            frontendQuestionType = "select"; // Map backend DROPDOWN to frontend 'select'
          } else if (frontendQuestionType === "checkbox") {
            frontendQuestionType = "checkbox"; // Map backend CHECKBOX to frontend 'checkbox'
          }

          let frontendOptions = ["Option 1"]; // Default
          if (
            (q.question.questionType === "DROPDOWN" ||
              q.question.questionType === "CHECKBOX") &&
            Array.isArray(q.question.options)
          ) {
            frontendOptions = q.question.options.map((opt) => opt.optionText);
          } else if (q.question.options) {
            // Fallback for other potential structures or existing data
            frontendOptions =
              typeof q.question.options === "string"
                ? JSON.parse(q.question.options)
                : q.question.options;
          }

          return {
            id: q.id, // This is EventQuestion.id
            text: q.question.questionText || "",
            type: frontendQuestionType,
            required: q.isRequired || false,
            options: frontendOptions,
            hasMaxLength: q.question.validationRules?.maxLength !== undefined,
            maxLength: q.question.validationRules?.maxLength || 255,
            order: q.displayOrder !== undefined ? q.displayOrder : 0,
            category: q.question.category || "",
            backendQuestionId: q.question.id, // This is Question.id
            backendEventQuestionId: q.id,
          };
        });
        originalQuestions.value = JSON.parse(JSON.stringify(questions.value));
      }
    } catch (err) {
      console.error("Error fetching event data:", err);
      Object.assign(eventForm.value, {
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        location: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        organizer: "",
        capacity: 100,
        eventType: "",
        isFree: false,
      });
      ticketTypes.value = [];
      questions.value = [];
    } finally {
      loading.value = false;
    }
  } else {
    // Direct end of load state in create mode
    loading.value = false;
  }
});

const handleValidation = () => {
  const { isValid, errors: validationErrors, firstErrorTab } = validateEventForm(
    eventForm.value,
    ticketTypes.value,
    questions.value
  );
  errors.value = validationErrors;
  if (!isValid && firstErrorTab) {
    activeTab.value = firstErrorTab;
  }
  return isValid;
};

const getTicketPayload = (ticket) => ({
  name: ticket.name,
  price: Number(ticket.price),
  quantityTotal: Number(ticket.quantity),
  description: ticket.description,
  salesStart: ticket.salesStart ? combineDateAndTime(ticket.salesStart, "00:00:00") : null,
  salesEnd: ticket.salesEnd ? combineDateAndTime(ticket.salesEnd, "23:59:59") : null,
});

const getQuestionPayload = (q, index) => {
  let backendQuestionType = q.type.toUpperCase();
  if (q.type === "select") {
    backendQuestionType = "DROPDOWN";
  } else if (q.type === "textarea") {
    backendQuestionType = "TEXT";
  } else if (q.type === "radio") {
    backendQuestionType = "DROPDOWN";
  } else if (q.type === "checkbox") {
    backendQuestionType = "CHECKBOX";
  }

  const questionPayload = {
    eventQuestionId: q.backendEventQuestionId,
    questionId: q.backendQuestionId,
    questionText: q.text,
    questionType: backendQuestionType,
    isRequired: q.required,
    displayOrder: q.order !== undefined ? q.order : index + 1,
  };

  if (
    (backendQuestionType === "DROPDOWN" || backendQuestionType === "CHECKBOX") &&
    Array.isArray(q.options)
  ) {
    questionPayload.options = q.options.map((optText, optIndex) => ({
      optionText: optText,
      displayOrder: optIndex + 1,
    }));
  }
  return questionPayload;
};

const saveEvent = async () => {
  if (!handleValidation()) {
    // The validation function now handles switching tabs.
    // We just need to scroll to the error.
    await nextTick();
    scrollToFirstError(errors.value);
    return;
  }
  saving.value = true;
  try {
    const eventPayload = {
      ...eventForm.value,
      capacity: Number(eventForm.value.capacity),
      startDateTime: combineDateAndTime(
        eventForm.value.startDate,
        eventForm.value.startTime
      ),
      endDateTime: combineDateAndTime(
        eventForm.value.endDate,
        eventForm.value.endTime
      ),
    };

    // For new events, include tickets and questions in the initial payload
    if (!isEditMode.value) {
      eventPayload.tickets = ticketTypes.value.map(ticket => getTicketPayload(ticket));
      eventPayload.questions = questions.value.map((q, index) => getQuestionPayload(q, index));
    }

    // Remove address fields if not provided
    if (!eventPayload.address) delete eventPayload.address;
    if (!eventPayload.city) delete eventPayload.city;
    if (!eventPayload.state) delete eventPayload.state;
    if (!eventPayload.zipCode) delete eventPayload.zipCode;
    if (!eventPayload.imageUrl) delete eventPayload.imageUrl;

    let currentEventId = eventId;

    if (isEditMode.value) {
      await updateEvent(currentEventId, eventPayload);

      // Synchronize tickets only in edit mode
      const originalTicketIds = originalTicketTypes.value.map(t => t.id);
      const currentTicketIds = ticketTypes.value.map(t => t.id).filter(id => id);

    for (const ticket of ticketTypes.value) {
      const payload = getTicketPayload(ticket);
      if (ticket.id && originalTicketTypes.value.some(t => t.id === ticket.id)) { // Existing ticket
        const originalTicket = originalTicketTypes.value.find(t => t.id === ticket.id);
        // Ensure originalTicket is not undefined before comparing
        if (originalTicket && JSON.stringify(getTicketPayload(originalTicket)) !== JSON.stringify(payload)) {
          await updateTicketForEvent(currentEventId, ticket.id, payload);
        }
      } else { // New ticket
        await createTicketForEvent(currentEventId, payload);
      }
    }

      for (const originalTicket of originalTicketTypes.value) {
        if (!currentTicketIds.includes(originalTicket.id)) {
          await deleteTicketForEvent(currentEventId, originalTicket.id);
        }
      }

      // Synchronize questions
      const originalQuestionIds = originalQuestions.value.map(q => q.id);
      const currentQuestionIds = questions.value.map(q => q.id).filter(id => id);

    for (const [index, question] of questions.value.entries()) {
      const payload = getQuestionPayload(question, index);
      if (question.id && originalQuestions.value.some(q => q.id === question.id)) { // Existing question
        const originalQuestion = originalQuestions.value.find(q => q.id === question.id);
        // Ensure originalQuestion is not undefined before comparing
        if (originalQuestion && JSON.stringify(getQuestionPayload(originalQuestion, index)) !== JSON.stringify(payload)) {
          await updateEventQuestion(currentEventId, question.id, payload);
        }
      } else { // New question
        await createEventQuestion(currentEventId, payload);
      }
    }

      for (const originalQuestion of originalQuestions.value) {
        if (!currentQuestionIds.includes(originalQuestion.id)) {
          await deleteEventQuestion(currentEventId, originalQuestion.id);
        }
      }
    } else {
      const newEvent = await createEvent(eventPayload);
      currentEventId = newEvent.id;
    }

    router.push("/admin/events");
  } catch (err) {
    console.error(
      "Error saving event:",
      err.message ? err.message : JSON.stringify(err)
    );
    errors.value.submit =
      err.message || "Failed to save event. Please try again.";
    if (err.errors) {
      Object.assign(errors.value, err.errors);
    }
  } finally {
    saving.value = false;
  }
};

const cancelForm = () => {
  router.push("/admin/events");
};


</script>

<template>
  <AdminLayout>
    <div class="p-4">
      <!-- Loading status -->
      <div v-if="loading" class="d-flex justify-content-center align-items-center" style="height: 16rem">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else>
        <!-- Form Header -->
        <div class="mb-4">
          <h1 class="fs-2 fw-bold text-dark">
            {{ isEditMode ? "Edit Event" : "Create New Event" }}
          </h1>
          <p class="text-muted mt-1">
            {{
              isEditMode
                ? "Update the details of your event"
                : "Fill out the form to create a new event"
            }}
          </p>
        </div>

        <!-- Forms Tab Navigation -->
        <div class="bg-white rounded shadow-sm mb-4">
          <div class="d-flex border-bottom overflow-auto">
            <button @click="activeTab = 'basic'" type="button"
              class="px-3 py-2 fs-6 fw-semibold text-nowrap bg-light border-0 no-border-btn"
              :class="activeTab === 'basic' ? 'text-primary' : 'text-muted'">
              <i class="pi pi-info-circle me-1"></i>
              Basic Information
            </button>
            <button @click="activeTab = 'tickets'" type="button"
              class="px-3 py-2 fs-6 fw-semibold text-nowrap bg-light border-0 no-border-btn"
              :class="activeTab === 'tickets' ? 'text-primary' : 'text-muted'">
              <i class="pi pi-ticket me-1"></i>
              Tickets
            </button>
            <button @click="activeTab = 'questionnaire'" type="button"
              class="px-3 py-2 fs-6 fw-semibold text-nowrap bg-light border-0 no-border-btn" :class="activeTab === 'questionnaire' ? 'text-primary' : 'text-muted'
                ">
              <i class="pi pi-list-alt me-1"></i>
              Questionnaire
            </button>
          </div>
        </div>

        <!-- Form content -->
        <div class="bg-white rounded shadow-sm p-4">
          <form @submit.prevent="saveEvent">
            <!-- Basic Info Tab -->
            <EventBasicInfo v-if="activeTab === 'basic'" v-model:eventForm="eventForm" :errors="errors"
              @image-uploaded="(url) => eventForm.imageUrl = url" />

            <!-- Tickets Tab -->
            <EventTickets v-if="activeTab === 'tickets'" v-model:ticketTypes="ticketTypes" :eventForm="eventForm"
              :errors="errors" :isEditMode="isEditMode" />

            <!-- Questionnaire Tab -->
            <EventQuestionnaire v-if="activeTab === 'questionnaire'" v-model:questions="questions" :errors="errors" />

            <!-- Form Action Buttons -->
            <div v-if="errors.submit" class="alert alert-danger">
              {{ errors.submit }}
            </div>
            <div class="mt-4 pt-3 border-top d-flex justify-content-end gap-3">
              <button @click="cancelForm" type="button" class="btn btn-outline-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary d-flex align-items-center" :disabled="saving">
                <span v-if="!saving">{{
                  isEditMode ? "Update Event" : "Create Event"
                  }}</span>
                <span v-else class="d-flex align-items-center">
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </span>
              </button>
            </div>
          </form>
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
