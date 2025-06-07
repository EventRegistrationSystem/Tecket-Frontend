<template>
  <div class="mb-4">
    <div v-if="errors.tickets" class="alert alert-danger">
      {{ errors.tickets }}
    </div>

    <div v-if="!eventForm.isFree" class="mb-4">
      <div
        v-for="(ticket, index) in ticketTypes"
        :key="ticket.id"
        class="card mb-3"
      >
        <div class="card-header bg-light">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <i class="pi pi-ticket me-2 text-primary"></i>
              <h6 class="mb-0">Ticket Type {{ index + 1 }}</h6>
            </div>
            <button
              v-if="ticketTypes.length > 1 || !isEditMode"
              @click="removeTicket(index)"
              type="button"
              class="btn btn-link text-danger p-0"
              title="Remove ticket type"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="card-body">
          <div class="row g-3 mb-3">
            <div class="col-12 col-md-6">
              <label class="form-label">
                Ticket Name <span class="text-danger">*</span>
              </label>
              <input
                :value="ticket.name"
                @input="updateTicket(index, 'name', $event.target.value)"
                type="text"
                placeholder="e.g. General Admission, VIP, Early Bird"
                class="form-control"
                :class="{ 'is-invalid': errors[`ticket_${index}_name`] }"
              />
              <div v-if="errors[`ticket_${index}_name`]" class="invalid-feedback">
                {{ errors[`ticket_${index}_name`] }}
              </div>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label">Description</label>
              <input
                :value="ticket.description"
                @input="updateTicket(index, 'description', $event.target.value)"
                type="text"
                placeholder="Brief description of this ticket type"
                class="form-control"
              />
            </div>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-12 col-md-6">
              <label class="form-label">
                Price ($) <span class="text-danger">*</span>
              </label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input
                  :id="`ticket_price_${index}`"
                  :name="`ticket_${index}_price`"
                  :value="ticket.price"
                  @input="updateTicket(index, 'price', parseFloat($event.target.value) || 0)"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  :class="{ 'is-invalid': errors[`ticket_${index}_price`] }"
                />
              </div>
              <div v-if="errors[`ticket_${index}_price`]" class="invalid-feedback">
                {{ errors[`ticket_${index}_price`] }}
              </div>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label">
                Quantity Available <span class="text-danger">*</span>
              </label>
              <input
                :id="`ticket_quantity_${index}`"
                :name="`ticket_${index}_quantity`"
                :value="ticket.quantity"
                @input="updateTicket(index, 'quantity', parseInt($event.target.value) || 0)"
                type="number"
                min="1"
                class="form-control"
                :class="{ 'is-invalid': errors[`ticket_${index}_quantity`] }"
              />
              <div v-if="errors[`ticket_${index}_quantity`]" class="invalid-feedback">
                {{ errors[`ticket_${index}_quantity`] }}
              </div>
            </div>
          </div>

          <div class="row g-3">
            <div class="col-md-6">
              <label :for="`ticket_salesStart_${index}`" class="form-label">
                Sales Start Date <span class="text-danger">*</span>
              </label>
              <input
                :id="`ticket_salesStart_${index}`"
                :name="`ticket_${index}_salesStart`"
                type="date"
                :value="ticket.salesStart"
                @input="updateTicket(index, 'salesStart', $event.target.value)"
                class="form-control"
                :class="{ 'is-invalid': errors[`ticket_${index}_salesStart`] }"
              />
              <div v-if="errors[`ticket_${index}_salesStart`]" class="invalid-feedback">
                {{ errors[`ticket_${index}_salesStart`] }}
              </div>
            </div>
            <div class="col-md-6">
              <label :for="`ticket_salesEnd_${index}`" class="form-label">
                Sales End Date <span class="text-danger">*</span>
              </label>
              <input
                :id="`ticket_salesEnd_${index}`"
                :name="`ticket_${index}_salesEnd`"
                type="date"
                :value="ticket.salesEnd"
                @input="updateTicket(index, 'salesEnd', $event.target.value)"
                class="form-control"
                :class="{ 'is-invalid': errors[`ticket_${index}_salesEnd`] }"
              />
              <div v-if="errors[`ticket_${index}_salesEnd`]" class="invalid-feedback">
                {{ errors[`ticket_${index}_salesEnd`] }}
              </div>
            </div>
          </div>

          <!-- Ticket Summary -->
          <div class="mt-3 p-3 bg-light rounded">
            <div class="row text-center">
              <div class="col-6">
                <div class="fw-bold text-primary">${{ ticket.price.toFixed(2) }}</div>
                <small class="text-muted">Price</small>
              </div>
              <div class="col-6">
                <div class="fw-bold text-success">{{ ticket.quantity }}</div>
                <small class="text-muted">Available</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mb-3">
        <button
          @click="addTicket"
          type="button"
          class="btn btn-outline-primary"
        >
          <i class="pi pi-plus me-2"></i>
          Add Another Ticket Type
        </button>
      </div>

      <!-- Capacity Warning -->
      <div class="alert alert-warning">
        <div class="d-flex align-items-start">
          <i class="pi pi-exclamation-triangle me-2 mt-1"></i>
          <div>
            <h6 class="alert-heading mb-1">Capacity Check</h6>
            <p class="mb-2">
              Total tickets available: <strong>{{ totalTickets }}</strong> | 
              Event capacity: <strong>{{ eventForm.capacity }}</strong>
            </p>
            <div v-if="totalTickets > eventForm.capacity" class="text-danger">
              <small>⚠️ Warning: Total tickets exceed event capacity!</small>
            </div>
            <div v-else class="text-success">
              <small>✓ Ticket allocation is within capacity limits</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Free Event Message -->
    <div v-else class="alert alert-info text-center">
      <div class="mb-2">
        <i class="pi pi-gift" style="font-size: 2rem;"></i>
      </div>
      <h5 class="mb-2">Free Event</h5>
      <p class="mb-0">
        This event is marked as free. No ticket configuration is needed.
        Attendees can register without payment.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getDefaultTicketType } from '../utils/eventFormUtils.js';

const props = defineProps({
  ticketTypes: {
    type: Array,
    required: true
  },
  eventForm: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  isEditMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:ticketTypes']);

const totalTickets = computed(() => {
  return props.ticketTypes.reduce((sum, ticket) => sum + (ticket.quantity || 0), 0);
});

const addTicket = async () => {
  const newTicket = getDefaultTicketType();
  if (props.isEditMode && props.eventForm.id) {
    try {
      const createdTicket = await createTicketForEvent(props.eventForm.id, newTicket);
      emit('update:ticketTypes', [...props.ticketTypes, createdTicket]);
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to add ticket. Please try again.');
    }
  } else {
    emit('update:ticketTypes', [...props.ticketTypes, newTicket]);
  }
};

const removeTicket = async (index) => {
  const ticketToRemove = props.ticketTypes[index];
  if (props.isEditMode && props.eventForm.id && ticketToRemove.id) {
    try {
      await deleteTicketForEvent(props.eventForm.id, ticketToRemove.id);
      const newTickets = props.ticketTypes.filter((_, i) => i !== index);
      emit('update:ticketTypes', newTickets);
    } catch (error) {
      console.error('Error deleting ticket:', error);
      alert('Failed to delete ticket. Please try again.');
    }
  } else {
    const newTickets = props.ticketTypes.filter((_, i) => i !== index);
    emit('update:ticketTypes', newTickets);
  }
};

const updateTicket = async (index, field, value) => {
  const newTickets = [...props.ticketTypes];
  newTickets[index] = { ...newTickets[index], [field]: value };
  emit('update:ticketTypes', newTickets);

  const updatedTicket = newTickets[index];
  if (props.isEditMode && props.eventForm.id && updatedTicket.id) {
    try {
      await updateTicketForEvent(props.eventForm.id, updatedTicket.id, updatedTicket);
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Failed to update ticket. Please try again.');
    }
  }
};
</script>

<style scoped>
.card-header {
  border-bottom: 1px solid #dee2e6;
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #ced4da;
}

.alert-heading {
  font-size: 1rem;
}

.pi {
  font-size: 1rem;
}

.btn-outline-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,123,255,0.25);
}

.card {
  transition: box-shadow 0.15s ease-in-out;
}

.card:hover {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
</style>
