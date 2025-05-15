<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'

// Importing events and ticket related interfaces from the API layer (both internally using authFetch for authorisation transfer)
import { fetchEventDetails, createEvent, updateEvent } from '@/api/eventServices.js'
import { fetchTicketTypes, createTicketType, updateTicketType } from '@/api/atickets.js'


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
  organizerContact: '',
  capacity: 100,
  status: 'Upcoming',
  imageUrl: '',
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

onMounted(async () => {
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
          organizer: typeof eventData.organizer === 'string'
            ? eventData.organizer
            : (eventData.organizer.firstName + ' ' + eventData.organizer.lastName),
          organizerContact: eventData.organizerContact || '',
          capacity: eventData.capacity || 100,
          status: eventData.status || 'Upcoming',
          imageUrl: eventData.imageUrl || 'https://placehold.co/600x400/eee/ccc?text=Event+Image',
        }
      }
      // Get the ticket type data, get the current event ticket type list through API interface
      ticketTypes.value = await fetchTicketTypes(eventId)
    } catch (err) {
      console.error('Error fetching event data:', err)
      // Setting default data to avoid page errors when exceptions occur
      eventForm.value = {
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
        organizerContact: '',
        capacity: 100,
        status: 'Upcoming',
        imageUrl: '',
      }
      ticketTypes.value = []
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
  if (!eventForm.value.name) {
    errors.value.name = 'Event name is required'
  }
  if (!eventForm.value.startDate) {
    errors.value.startDate = 'Event start date is required'
  }
  if (!eventForm.value.endDate) {
    errors.value.endDate = 'Event end date is required'
  }
  if (!eventForm.value.location) {
    errors.value.location = 'Location is required'
  }
  if (!eventForm.value.capacity || eventForm.value.capacity <= 0) {
    errors.value.capacity = 'Valid capacity is required'
  }
  if (ticketTypes.value.length === 0) {
    errors.value.tickets = 'At least one ticket type is required'
  }
  return Object.keys(errors.value).length === 0
}

const addTicketType = () => {
  // Temporary ID is used by default when adding a ticket (the backend will return the official ID on subsequent saves)
  ticketTypes.value.push({
    id: Date.now(), // Temporary IDs use the current timestamp
    name: '',
    price: 0.0,
    quantity: 0, // Corresponds to the API field quantity_total
    description: '',
  })
}

const removeTicketType = (index) => {
  ticketTypes.value.splice(index, 1)
}

// Save events: APIs are called according to the editing or creation mode respectively
const saveEvent = async () => {
  if (!validateForm()) {
    return
  }
  saving.value = true
  try {
    if (isEditMode.value) {
      // Edit mode: call updateEvent to update the event details.
      await updateEvent(eventId, eventForm.value)
      // Processing ticket data: iterating through each ticket type
      for (const ticket of ticketTypes.value) {
        // Assume that existing tickets (ID returned by the API is numeric) need to be updated, otherwise they are considered new tickets
        if (typeof ticket.id === 'number' && ticket.id < 10000000000) {
          // Updated ticket type data
          await updateTicketType(eventId, ticket.id, {
            name: ticket.name,
            price: ticket.price,
            quantityTotal: ticket.quantity,
            description: ticket.description,
          })
        } else {
          // New Ticket: Create a Ticket
          await createTicketType(eventId, {
            name: ticket.name,
            price: ticket.price,
            quantityTotal: ticket.quantity,
            description: ticket.description,
          })
        }
      }
    } else {
      // Creation mode: call createEvent to create a new event.
      const createdEvent = await createEvent(eventForm.value)
      const newEventId = createdEvent.id
      // Creation of ticket data
      for (const ticket of ticketTypes.value) {
        await createTicketType(newEventId, {
          name: ticket.name,
          price: ticket.price,
          quantityTotal: ticket.quantity,
          description: ticket.description,
        })
      }
    }
    router.push('/admin/events')
  } catch (err) {
    console.error('Error saving event:', err)
    // A more detailed error message can be added here
  } finally {
    saving.value = false
  }
}

const cancelForm = () => {
  router.push('/admin/events')
}

const addQuestion = () => {
  const newId = Date.now()
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
              <div class="mb-3 mt-3">
                <label class="form-label">Image URL</label>
                <input v-model="eventForm.imageUrl" type="text" placeholder="URL to event image" class="form-control" />
                <div class="form-text">
                  Enter a URL for the event image. For best results, use a 16:9 aspect ratio image.
                </div>
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
                  <button v-if="ticketTypes.length > 1" @click="removeTicketType(index)" type="button"
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
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label class="form-label">Price ($)</label>
                    <input v-model="ticket.price" type="number" step="0.01" min="0" class="form-control" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Quantity Available</label>
                    <input v-model="ticket.quantity" type="number" min="1" class="form-control" />
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
              <div v-if="!questions.length" class="alert alert-light text-center">
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
                      <label class="form-label">Question Text</label>
                      <input v-model="question.text" type="text" placeholder="Enter your question" class="form-control" />
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
                  <div v-if="['select', 'radio', 'checkbox'].includes(question.type)" class="mb-3 p-3">
                    <label class="form-label mb-2">Options</label>
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
                  <div class="d-flex align-items-center gap-3">
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
