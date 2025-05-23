<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/views/admin/AdminLayout.vue'

// Importing API services
import { fetchEventDetails, createEvent, updateEvent } from '@/api/eventServices.js'
import { fetchTicketsForEvent, createTicketForEvent, updateTicketForEvent, deleteTicketForEvent } from '@/api/ticketServices.js'
import { fetchEventQuestions, createEventQuestion, updateEventQuestion, deleteEventQuestion } from '@/api/questionServices.js'

const route = useRoute()
const router = useRouter()

// Determine if you are in edit mode (routes containing '/edit/' are in edit mode)
const isEditMode = computed(() => route.path.includes('/edit/'))
const eventId = isEditMode.value ? parseInt(route.params.id) : null

// Define states such as loading, saving, etc.
const loading = ref(true)
const saving = ref(false)
const activeTab = ref('basic')
const questions = ref([]) 

// form status, fields are initialised by default in create mode
// Split the original date field into startDate and endDate.
const eventForm = ref({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  location: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  organizer: '',
  capacity: 100,
  status: 'PUBLISHED',
  imageUrl: '',
  eventType: '',
  isFree: false,
})

// Ticket data (taken from interface when editing, default empty array when creating)
const ticketTypes = ref([])

// Error messages for form validation
const errors = ref({})

// helper function: extract date from ISO time string, format is YYYY-MM-DD
const parseDate = (dateTimeString) => {
  if (!dateTimeString) return ''
  const dateObj = new Date(dateTimeString)
  if (isNaN(dateObj)) return ''
  const year = dateObj.getFullYear()
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const day = dateObj.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Auxiliary function: extracts the time from the ISO time string in the format HH:MM (24-hour format)
const parseTime = (dateTimeString) => {
  if (!dateTimeString) return ''
  const dateObj = new Date(dateTimeString)
  if (isNaN(dateObj)) return ''
  const hours = dateObj.getHours().toString().padStart(2, '0')
  const minutes = dateObj.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// Helper function to combine date and time strings into ISO 8601 format
const combineDateAndTime = (dateString, timeString) => {
  if (!dateString || typeof dateString !== 'string' || !dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    console.error('Invalid or empty dateString provided to combineDateAndTime:', dateString);
    return null;
  }

  let timePart = '00:00:00';
  if (timeString && typeof timeString === 'string') {
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      timePart = `${timeString}:00`;
    } else if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
      timePart = timeString;
    }
  }

  const isoString = `${dateString}T${timePart}.000Z`;

  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    console.error('Invalid date or time for ISO conversion:', isoString);
    return null;
  }
  return date.toISOString();
};

const originalTicketTypes = ref([]);
const originalQuestions = ref([]);

onMounted(async () => {
  // Check for tab query parameter and set activeTab
  const tabFromQuery = route.query.tab;
  if (tabFromQuery && ['basic', 'tickets', 'questionnaire'].includes(tabFromQuery)) {
    activeTab.value = tabFromQuery;
  }

  if (isEditMode.value) {
    try {
      loading.value = true
      // Getting event details from the API
      const eventData = await fetchEventDetails(eventId)
      if (eventData) {
        // Populate the eventForm to convert the startDateTime and endDateTime returned by the API to extract the date and time, respectively.
        eventForm.value = {
          name: eventData.name || '',
          description: eventData.description || '',
          startDate: parseDate(eventData.startDateTime),
          endDate: parseDate(eventData.endDateTime),
          startTime: parseTime(eventData.startDateTime),
          endTime: parseTime(eventData.endDateTime),
          location: eventData.location || '',
          address: eventData.address || '',
          city: eventData.city || '',
          state: eventData.state || '',
          zipCode: eventData.zipCode || '',
          organizer: typeof eventData.organizer === 'object' && eventData.organizer !== null ? `${eventData.organizer.firstName} ${eventData.organizer.lastName}` : eventData.organizer || '',
          
          capacity: eventData.capacity || 100,
          // status: eventData.status || 'Upcoming',
          // imageUrl: eventData.imageUrl || 'https://placehold.co/600x400/eee/ccc?text=Event+Image',
          eventType: eventData.eventType || '',
          isFree: eventData.isFree || false,
        };

        const fetchedTickets = await fetchTicketsForEvent(eventId);
        ticketTypes.value = fetchedTickets.map(t => ({
          id: t.id,
          name: t.name || '',
          price: t.price !== undefined ? Number(t.price) : 0,
          quantity: t.quantityTotal || 0,
          description: t.description || '',
          salesStart: t.salesStart ? parseDate(t.salesStart) : '',
          salesEnd: t.salesEnd ? parseDate(t.salesEnd) : '',
        }));
        originalTicketTypes.value = JSON.parse(JSON.stringify(ticketTypes.value));

        const fetchedQuestions = await fetchEventQuestions(eventId);
        questions.value = fetchedQuestions.map(q => {
          let frontendQuestionType = (q.question.questionType || 'text').toLowerCase();
          if (frontendQuestionType === 'dropdown') {
            frontendQuestionType = 'select'; // Map backend DROPDOWN to frontend 'select'
          }

          let frontendOptions = ['Option 1']; // Default
          if (q.question.questionType === 'DROPDOWN' && Array.isArray(q.question.options)) {
            frontendOptions = q.question.options.map(opt => opt.optionText);
          } else if (q.question.options) {
            // Fallback for other potential structures or existing data
            frontendOptions = typeof q.question.options === 'string' ? JSON.parse(q.question.options) : q.question.options;
          }

          return {
            id: q.id, // This is EventQuestion.id
            text: q.question.questionText || '',
            type: frontendQuestionType,
            required: q.isRequired || false,
            options: frontendOptions,
            hasMaxLength: q.question.validationRules?.maxLength !== undefined,
            maxLength: q.question.validationRules?.maxLength || 255,
            order: q.displayOrder !== undefined ? q.displayOrder : 0,
            category: q.question.category || '',
            backendQuestionId: q.question.id, // This is Question.id
            backendEventQuestionId: q.id, // Redundant, same as id above
          };
        });
        originalQuestions.value = JSON.parse(JSON.stringify(questions.value));
      }
    } catch (err) {
      console.error('Error fetching event data:', err);
      Object.assign(eventForm.value, {
        name: '', description: '', startDate: '', endDate: '', startTime: '', endTime: '',
        location: '', address: '', city: '', state: '', zipCode: '', organizer: '', capacity: 100, status: 'Upcoming', eventType: '', isFree: false,
      });
      ticketTypes.value = [];
      questions.value = [];
    } finally {
      loading.value = false
    }
  } else {
    // Direct end of load state in create mode
    loading.value = false
  }
})

// Verify that the form inputs are correct
const validateForm = () => {
  errors.value = {}
  if (!eventForm.value.name) errors.value.name = 'Event name is required';
  if (!eventForm.value.startDate) errors.value.startDate = 'Event start date is required';
  if (!eventForm.value.endDate) errors.value.endDate = 'Event end date is required';
  if (eventForm.value.startDate && new Date(eventForm.value.startDate) < new Date()) {
    // Allow past dates for editing, but not for new events if that's a requirement (not strictly enforced here)
    // errors.value.startDate = 'Event start date must be in the future'; 
  }
  if (eventForm.value.startDate && eventForm.value.endDate && new Date(eventForm.value.endDate) < new Date(eventForm.value.startDate)) {
    errors.value.endDate = 'End date must be after start date';
  }
  if (!eventForm.value.location) errors.value.location = 'Location is required';
  if (!eventForm.value.capacity || eventForm.value.capacity <= 0) errors.value.capacity = 'Valid capacity is required';
  if (!eventForm.value.eventType) errors.value.eventType = 'Event type is required';

  if (eventForm.value.isFree === false && ticketTypes.value.length === 0) {
    errors.value.tickets = 'At least one ticket type is required for paid events.';
  }
  if (eventForm.value.isFree === false) {
    ticketTypes.value.forEach((ticket, index) => {
      if (!ticket.name) errors.value[`ticket_${index}_name`] = `Ticket ${index + 1} name is required.`;
      if (ticket.price === undefined || ticket.price < 0) errors.value[`ticket_${index}_price`] = `Ticket ${index + 1} price is invalid.`;
      if (ticket.quantity === undefined || ticket.quantity <= 0) errors.value[`ticket_${index}_quantity`] = `Ticket ${index + 1} quantity is invalid.`;

      if (!ticket.salesStart) {
        errors.value[`ticket_${index}_salesStart`] = `Ticket ${index + 1} sales start date is required.`;
      } else if (!ticket.salesStart.match(/^\d{4}-\d{2}-\d{2}$/)) {
        errors.value[`ticket_${index}_salesStart`] = `Ticket ${index + 1} sales start date must be a valid date (YYYY-MM-DD).`;
      }

      if (!ticket.salesEnd) {
        errors.value[`ticket_${index}_salesEnd`] = `Ticket ${index + 1} sales end date is required.`;
      } else if (!ticket.salesEnd.match(/^\d{4}-\d{2}-\d{2}$/)) {
        errors.value[`ticket_${index}_salesEnd`] = `Ticket ${index + 1} sales end date must be a valid date (YYYY-MM-DD).`;
      }

      if (ticket.salesStart && ticket.salesEnd && ticket.salesStart.match(/^\d{4}-\d{2}-\d{2}$/) && ticket.salesEnd.match(/^\d{4}-\d{2}-\d{2}$/) && new Date(ticket.salesEnd) < new Date(ticket.salesStart)) {
        errors.value[`ticket_${index}_salesEnd`] = `Ticket ${index + 1} sales end date must be after sales start date.`;
      }
    });
  }

  if (questions.value.length === 0) {
    // Making questions optional for now, can be changed if needed
    // errors.value.questions = 'At least one question is required.';
  } else {
    questions.value.forEach((q, index) => {
      if (!q.text.trim()) errors.value[`question_${index}_text`] = `Question ${index + 1} text is required.`;
      // Add validation for options if question type is 'select' (DROPDOWN)
      if (q.type === 'select' && (!q.options || q.options.length === 0 || q.options.some(opt => !opt.trim()))) {
        errors.value[`question_${index}_options`] = `Question ${index + 1} (Dropdown) must have at least one non-empty option.`;
      }
    });
  }

  return Object.keys(errors.value).length === 0;
}

const addTicketType = () => {
  ticketTypes.value.push({
    id: Date.now(), // Temporary ID for v-for key, backend will assign real ID
    name: '',
    price: 0.0,
    quantity: 1, 
    description: '',
    salesStart: '',
    salesEnd: '',
  })
}

const removeTicketType = (index) => {
  ticketTypes.value.splice(index, 1)
}

const saveEvent = async () => {
  if (!validateForm()) {
    const firstErrorKey = Object.keys(errors.value)[0];
    if (firstErrorKey) {
      const errorElement = document.querySelector(`[name="${firstErrorKey}"]`) || document.querySelector(`.${firstErrorKey}`) || document.querySelector(`#${firstErrorKey}`);
      if (errorElement && typeof errorElement.scrollIntoView === 'function') {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const mainForm = document.querySelector('form');
        mainForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    return;
  }
  saving.value = true;
  try {
    const eventPayload = {
      ...eventForm.value,
      capacity: Number(eventForm.value.capacity),
      startDateTime: combineDateAndTime(eventForm.value.startDate, eventForm.value.startTime),
      endDateTime: combineDateAndTime(eventForm.value.endDate, eventForm.value.endTime),
      tickets: eventForm.value.isFree ? [] : ticketTypes.value.map(ticket => ({
        id: isEditMode.value && ticket.id && !isNaN(parseInt(ticket.id)) && Number.isInteger(Number(ticket.id)) ? Number(ticket.id) : undefined, // Send ID only if it's a valid existing ID
        name: ticket.name,
        price: Number(ticket.price),
        quantityTotal: Number(ticket.quantity),
        description: ticket.description,
        salesStart: ticket.salesStart ? combineDateAndTime(ticket.salesStart, '00:00:00') : null,
        salesEnd: ticket.salesEnd ? combineDateAndTime(ticket.salesEnd, '23:59:59') : null,
      })),
      questions: questions.value.map((q, index) => {
        let backendQuestionType = q.type.toUpperCase();
        if (q.type === 'select') {
          backendQuestionType = 'DROPDOWN';
        } else if (q.type === 'textarea') {
          backendQuestionType = 'TEXT'; 
        } else if (q.type === 'radio') { 
          // 'radio' on frontend maps to 'DROPDOWN' on backend for single choice
          backendQuestionType = 'DROPDOWN';
        } else if (q.type === 'checkbox') {
          // 'checkbox' on frontend maps to 'CHECKBOX' on backend

          backendQuestionType = 'CHECKBOX';
        }
        // Other types like date, email, number might map to TEXT or specific backend types

        const questionPayload = {
          eventQuestionId: isEditMode.value && q.backendEventQuestionId ? q.backendEventQuestionId : undefined,
          questionId: isEditMode.value && q.backendQuestionId ? q.backendQuestionId : undefined,
          questionText: q.text,
          questionType: backendQuestionType,
          isRequired: q.required,
          displayOrder: q.order !== undefined ? q.order : index + 1,
        };

        if ((backendQuestionType === 'DROPDOWN' || backendQuestionType === 'CHECKBOX') && Array.isArray(q.options)) {
          questionPayload.options = q.options.map((optText, optIndex) => ({
            // For existing options, we might need to send their IDs if backend supports option updates by ID
            optionText: optText,
            displayOrder: optIndex + 1,
          }));
        }
        return questionPayload;
      }),
    };
    
    // Remove address fields if not provided, to avoid sending empty strings if backend expects null/omitted
    if (!eventPayload.address) delete eventPayload.address;
    if (!eventPayload.city) delete eventPayload.city;
    if (!eventPayload.state) delete eventPayload.state;
    if (!eventPayload.zipCode) delete eventPayload.zipCode;
    if (!eventPayload.imageUrl) delete eventPayload.imageUrl;


    console.log('Event Payload being sent:', JSON.stringify(eventPayload, null, 2));

    if (isEditMode.value) {
      await updateEvent(eventId, eventPayload);
    } else {
      await createEvent(eventPayload);
    }
    router.push('/admin/events');
  } catch (err) {
    console.error('Error saving event:', err.message ? err.message : JSON.stringify(err));
    errors.value.submit = err.message || 'Failed to save event. Please try again.';
    if (err.errors) { // If backend sends specific field errors
        Object.assign(errors.value, err.errors);
    }
  } finally {
    saving.value = false;
  }
};

const cancelForm = () => {
  router.push('/admin/events')
}

const addQuestion = () => {
  const newId = `new_${Date.now()}` // Temporary frontend ID
  questions.value.push({
    id: newId, 
    text: '',
    type: 'text', 
    required: false,
    options: ['Option 1'], 
    hasMaxLength: false,
    maxLength: 255,
    order: questions.value.length + 1,
  })
}

const removeQuestion = (index) => {
  questions.value.splice(index, 1)
}

const addOption = (question) => {
  question.options.push(`Option ${question.options.length + 1}`)
}

const removeOption = (question, optionIndex) => {
  if (question.options.length > 1) {
    question.options.splice(optionIndex, 1)
  }
}
</script>

<template>
  <AdminLayout>
    <div class="p-4">
      <!-- Loading status -->
      <div v-if="loading" class="d-flex justify-content-center align-items-center" style="height: 16rem;">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div v-else>
        <!-- Form Header -->
        <div class="mb-4">
          <h1 class="fs-2 fw-bold text-dark">
            {{ isEditMode ? 'Edit Event' : 'Create New Event' }}
          </h1>
          <p class="text-muted mt-1">
            {{ isEditMode ? 'Update the details of your event' : 'Fill out the form to create a new event' }}
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
              class="px-3 py-2 fs-6 fw-semibold text-nowrap bg-light border-0 no-border-btn"
              :class="activeTab === 'questionnaire' ? 'text-primary' : 'text-muted'">
              <i class="pi pi-list-alt me-1"></i>
              Questionnaire
            </button>
          </div>
        </div>
        
        <!-- Form content -->
        <div class="bg-white rounded shadow-sm p-4">
          <form @submit.prevent="saveEvent">
            <!-- Basic Info Tab -->
            <div v-if="activeTab === 'basic'" class="mb-4">
              <div class="mb-3">
                <label class="form-label">
                  Event Name <span class="text-danger">*</span>
                </label>
                <input v-model="eventForm.name" type="text" placeholder="Enter event name" class="form-control"
                  :class="{ 'is-invalid': errors.name }" />
                <div v-if="errors.name" class="invalid-feedback">
                  {{ errors.name }}
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea v-model="eventForm.description" placeholder="Describe your event" rows="4"
                  class="form-control"></textarea>
              </div>
              <!-- Location Field -->
              <div class="mb-3">
                <label class="form-label">
                  Location <span class="text-danger">*</span>
                </label>
                <input v-model="eventForm.location" type="text" placeholder="Enter venue or location" class="form-control"
                  :class="{ 'is-invalid': errors.location }" />
                <div v-if="errors.location" class="invalid-feedback">
                  {{ errors.location }}
                </div>
              </div>
              <div class="mb-3">
                <p class="small fst-italic text-muted">
                  The address information helps attendees locate your event. It will be displayed on the event details page.
                </p>
              </div>
              <div class="row g-3">
                <div class="col-12 col-md-3">
                  <label class="form-label">
                    Start Date <span class="text-danger">*</span>
                  </label>
                  <input v-model="eventForm.startDate" type="date" class="form-control"
                    :class="{ 'is-invalid': errors.startDate }" />
                  <div v-if="errors.startDate" class="invalid-feedback">
                    {{ errors.startDate }}
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <label class="form-label">
                    End Date <span class="text-danger">*</span>
                  </label>
                  <input v-model="eventForm.endDate" type="date" class="form-control"
                    :class="{ 'is-invalid': errors.endDate }" />
                  <div v-if="errors.endDate" class="invalid-feedback">
                    {{ errors.endDate }}
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <label class="form-label">Start Time</label>
                  <input v-model="eventForm.startTime" type="time" class="form-control" />
                </div>
                <div class="col-12 col-md-3">
                  <label class="form-label">End Time</label>
                  <input v-model="eventForm.endTime" type="time" class="form-control" />
                </div>
              </div>
              <div class="row g-3 mt-3">
                <div class="col-12 col-md-6">
                  <label class="form-label">Organizer</label>
                  <input v-model="eventForm.organizer" type="text" placeholder="Organizing company or person"
                    class="form-control" />
                </div>
              </div>
              <div class="row g-3 mt-3">
                <div class="col-12 col-md-6">
                  <label class="form-label">
                    Capacity <span class="text-danger">*</span>
                  </label>
                  <input v-model="eventForm.capacity" type="number" min="1" class="form-control"
                    :class="{ 'is-invalid': errors.capacity }" />
                  <div v-if="errors.capacity" class="invalid-feedback">
                    {{ errors.capacity }}
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Status</label>
                  <select v-model="eventForm.status" class="form-select">
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="Draft">Draft</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Event Type <span class="text-danger">*</span></label>
                <select v-model="eventForm.eventType" class="form-select" :class="{ 'is-invalid': errors.eventType }">
                  <option value="" disabled>Select event type</option>
                  <option value="SPORTS">Sports</option>
                  <option value="MUSICAL">Musical</option>
                  <option value="SOCIAL">Social</option>
                  <option value="VOLUNTEERING">Volunteering</option>
                  <option value="CONFERENCE">Conference</option>
                </select>
                <div v-if="errors.eventType" class="invalid-feedback">{{ errors.eventType }}</div>
              </div>
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="isFreeEvent" v-model="eventForm.isFree">
                <label class="form-check-label" for="isFreeEvent">This is a free event</label>
              </div>
            </div>
            
            <!-- Tickets Tab -->
            <div v-if="activeTab === 'tickets'" class="mb-4">
              <div v-if="errors.tickets" class="alert alert-danger">
                {{ errors.tickets }}
              </div>
              <div v-for="(ticket, index) in ticketTypes" :key="ticket.id" class="bg-light p-3 rounded mb-3">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <h3 class="h6 mb-0">Ticket Type {{ index + 1 }}</h3>
                  <button v-if="ticketTypes.length > 1 || !isEditMode" @click="removeTicketType(index)" type="button"
                    class="btn btn-link text-danger p-0">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
                <div class="row g-3 mb-3">
                  <div class="col-12 col-md-6">
                    <label class="form-label">Name</label>
                    <input v-model="ticket.name" type="text" placeholder="e.g. General Admission" class="form-control" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Description</label>
                    <input v-model="ticket.description" type="text" placeholder="Brief description" class="form-control" />
                  </div>
                </div>
                <div class="row g-3 mb-3">
                  <div class="col-12 col-md-6">
                    <label class="form-label">Price ($) <span class="text-danger">*</span></label>
                    <input :id="`ticket_price_${index}`" :name="`ticket_${index}_price`" v-model.number="ticket.price" type="number" step="0.01" min="0" class="form-control" :class="{ 'is-invalid': errors[`ticket_${index}_price`] }" />
                    <div v-if="errors[`ticket_${index}_price`]" class="invalid-feedback">{{ errors[`ticket_${index}_price`] }}</div>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Quantity Available <span class="text-danger">*</span></label>
                    <input :id="`ticket_quantity_${index}`" :name="`ticket_${index}_quantity`" v-model.number="ticket.quantity" type="number" min="1" class="form-control" :class="{ 'is-invalid': errors[`ticket_${index}_quantity`] }" />
                    <div v-if="errors[`ticket_${index}_quantity`]" class="invalid-feedback">{{ errors[`ticket_${index}_quantity`] }}</div>
                  </div>
                </div>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label :for="`ticket_salesStart_${index}`" class="form-label">Sales Start Date <span class="text-danger">*</span></label>
                    <input :id="`ticket_salesStart_${index}`" :name="`ticket_${index}_salesStart`" type="date" v-model="ticket.salesStart" class="form-control" :class="{ 'is-invalid': errors[`ticket_${index}_salesStart`] }">
                    <div v-if="errors[`ticket_${index}_salesStart`]" class="invalid-feedback">{{ errors[`ticket_${index}_salesStart`] }}</div>
                  </div>
                  <div class="col-md-6">
                    <label :for="`ticket_salesEnd_${index}`" class="form-label">Sales End Date <span class="text-danger">*</span></label>
                    <input :id="`ticket_salesEnd_${index}`" :name="`ticket_${index}_salesEnd`" type="date" v-model="ticket.salesEnd" class="form-control" :class="{ 'is-invalid': errors[`ticket_${index}_salesEnd`] }">
                    <div v-if="errors[`ticket_${index}_salesEnd`]" class="invalid-feedback">{{ errors[`ticket_${index}_salesEnd`] }}</div>
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <button @click="addTicketType" type="button" class="btn btn-link text-primary">
                  <i class="pi pi-plus me-1"></i>
                  Add Another Ticket Type
                </button>
              </div>
              <div class="alert alert-warning">
                <h4 class="h6">Important Note</h4>
                <p class="small">
                  Make sure the total number of tickets available does not exceed the event capacity. Current capacity: {{ eventForm.capacity }} attendees.
                </p>
              </div>
            </div>
 
            <!-- Questionnaire Tab -->
            <div v-if="activeTab === 'questionnaire'" class="mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h3 class="h6">Registration Questions</h3>
                  <p class="small text-muted">
                    Create questions that attendees will answer during registration
                  </p>
                </div>
                <button @click="addQuestion" type="button" class="btn btn-primary d-flex align-items-center">
                  <i class="pi pi-plus me-2"></i>
                  Add Question
                </button>
              </div>
              <div v-if="!questions.length && errors.questions" class="alert alert-danger">
                 {{ errors.questions }}
              </div>
              <div v-if="!questions.length && !errors.questions" class="alert alert-light text-center">
                <div class="text-muted mb-2">
                  <i class="pi pi-list-alt"></i>
                </div>
                <h4 class="h6 mb-2">No questions</h4>
                <p class="small text-muted mb-3">
                  Add questions to collect information from your attendees during registration
                </p>
                <button @click="addQuestion" type="button" class="btn btn-primary d-inline-flex align-items-center">
                  <i class="pi pi-plus me-2"></i>
                  Add First Question
                </button>
              </div>
              <div v-else class="mb-4">
                <div v-for="(question, index) in questions" :key="question.id" class="bg-white border rounded overflow-hidden mb-3">
                  <!-- Question header -->
                  <div class="bg-light px-3 py-2 d-flex justify-content-between align-items-center border-bottom">
                    <div class="d-flex align-items-center">
                      <i class="pi pi-bars text-muted me-3" style="cursor: move;"></i>
                      <span class="fw-semibold text-dark">Question {{ index + 1 }}</span>
                      <span v-if="question.required" class="small bg-danger text-white px-2 py-1 rounded-pill ms-2">
                        Required
                      </span>
                    </div>
                    <div class="d-flex align-items-center">
                      <span class="small text-muted bg-light px-2 py-1 rounded me-2">
                        {{ question.type }}
                      </span>
                      <button @click="removeQuestion(index)" type="button" class="btn btn-link text-danger p-0">
                        <i class="pi pi-trash"></i>
                      </button>
                    </div>
                  </div>
                  <!-- Question content -->
                  <div class="p-3">
                    <div class="mb-3">
                      <label :for="`question_text_${index}`" class="form-label">Question Text</label>
                      <input :id="`question_text_${index}`" :name="`question_${index}_text`" v-model="question.text" type="text" placeholder="Enter your question" class="form-control" :class="{ 'is-invalid': errors[`question_${index}_text`] }" />
                       <div v-if="errors[`question_${index}_text`]" class="invalid-feedback">{{ errors[`question_${index}_text`] }}</div>
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Question Type</label>
                      <select v-model="question.type" class="form-select">
                        <option value="text">Text Input</option>
                        <option value="textarea">Text Area (long text)</option>
                        <option value="select">Dropdown</option>
                        <option value="radio">Multiple Choice (single selection)</option>
                        <option value="checkbox">Checkboxes (multiple selection)</option>
                        <option value="date">Date</option>
                        <option value="email">Email</option>
                        <option value="number">Number</option>
                      </select>
                    </div>
                  </div>
                  <!-- Options for select, radio or checkbox types -->
                  <div v-if="['select', 'radio', 'checkbox'].includes(question.type)" class="mb-3 p-3 border-top">
                    <label class="form-label mb-2">Options</label>
                     <div v-if="errors[`question_${index}_options`]" class="alert alert-danger small p-2">{{ errors[`question_${index}_options`] }}</div>
                    <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="d-flex align-items-center mb-2">
                      <input v-model="question.options[optionIndex]" type="text" placeholder="Option text" class="form-control" />
                      <button @click="removeOption(question, optionIndex)" type="button" class="btn btn-link text-danger ms-2"
                        :disabled="question.options.length <= 1">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                    <button @click="addOption(question)" type="button" class="btn btn-link text-primary mt-2 small">
                      <i class="pi pi-plus me-1"></i>
                      Add Option
                    </button>
                  </div>
                  <!-- Additional settings -->
                  <div class="p-3 border-top d-flex align-items-center gap-3">
                    <label class="d-flex align-items-center mb-0">
                      <input v-model="question.required" type="checkbox" class="form-check-input me-2" />
                      <span class="small text-dark">Required</span>
                    </label>
                    <label v-if="question.type === 'text' || question.type === 'textarea'" class="d-flex align-items-center mb-0">
                      <input v-model="question.hasMaxLength" type="checkbox" class="form-check-input me-2" />
                      <span class="small text-dark">Set max length</span>
                    </label>
                  </div>
                </div>
              </div>
              <div class="alert alert-info">
                <h4 class="h6 fw-semibold mb-1">Tips for Creating Questions</h4>
                <ul class="list-disc list-inside small text-info">
                  <li>Keep questions clear and concise</li>
                  <li>Only make questions required if you absolutely need the information</li>
                  <li>Use appropriate question types for the data you're collecting</li>
                  <li>Consider the privacy implications of the data you collect</li>
                </ul>
              </div>
            </div>
            
            <!-- Form Action Buttons -->
             <div v-if="errors.submit" class="alert alert-danger">
                {{ errors.submit }}
            </div>
            <div class="mt-4 pt-3 border-top d-flex justify-content-end gap-3">
              <button @click="cancelForm" type="button" class="btn btn-outline-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary d-flex align-items-center" :disabled="saving">
                <span v-if="!saving">{{ isEditMode ? 'Update Event' : 'Create Event' }}</span>
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
