<template>
  <div class="mb-4">
    <div class="mb-3">
      <label class="form-label">
        Event Name <span class="text-danger">*</span>
      </label>
      <input
        :value="eventForm.name"
        @input="$emit('update:eventForm', { ...eventForm, name: $event.target.value })"
        type="text"
        placeholder="Enter event name"
        class="form-control"
        :class="{ 'is-invalid': errors.name }"
      />
      <div v-if="errors.name" class="invalid-feedback">
        {{ errors.name }}
      </div>
    </div>

    <!-- Event Image Uploader -->
    <div class="mb-3">
      <label class="form-label">
        Event Image <span class="text-danger">*</span>
      </label>
      <div class="d-flex align-items-center gap-3">
        <input
          type="file"
          @change="handleImageUpload"
          accept="image/png, image/jpeg, image/jpg"
          class="form-control"
          style="max-width: 300px;"
        />
        <div v-if="imageUploading" class="d-flex align-items-center text-muted">
          <div class="spinner-border spinner-border-sm me-2" role="status"></div>
          <span class="small">Uploading...</span>
        </div>
        <div v-if="imageUrl" class="d-flex align-items-center text-success">
          <i class="pi pi-check-circle me-2"></i>
          <span class="small">Image uploaded successfully</span>
        </div>
      </div>
      <div class="form-text">
        Supported formats: PNG, JPEG, JPG. Maximum file size: 5MB
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label">Description</label>
      <textarea
        :value="eventForm.description"
        @input="$emit('update:eventForm', { ...eventForm, description: $event.target.value })"
        placeholder="Describe your event"
        rows="4"
        class="form-control"
      ></textarea>
      <div class="form-text">
        Provide a detailed description to help attendees understand what your event is about
      </div>
    </div>

    <!-- Location Field -->
    <div class="mb-3">
      <label class="form-label">
        Location <span class="text-danger">*</span>
      </label>
      <input
        :value="eventForm.location"
        @input="$emit('update:eventForm', { ...eventForm, location: $event.target.value })"
        type="text"
        placeholder="Enter venue or location"
        class="form-control"
        :class="{ 'is-invalid': errors.location }"
      />
      <div v-if="errors.location" class="invalid-feedback">
        {{ errors.location }}
      </div>
    </div>

    <div class="mb-3">
      <p class="small fst-italic text-muted">
        The address information helps attendees locate your event. It will be displayed on the event details page.
      </p>
    </div>

    <!-- Date and Time Section -->
    <div class="card mb-3">
      <div class="card-header bg-light">
        <h6 class="mb-0">
          <i class="pi pi-calendar me-2"></i>
          Event Schedule
        </h6>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-12 col-md-3">
            <label class="form-label">
              Start Date <span class="text-danger">*</span>
            </label>
            <input
              :value="eventForm.startDate"
              @input="$emit('update:eventForm', { ...eventForm, startDate: $event.target.value })"
              type="date"
              class="form-control"
              :class="{ 'is-invalid': errors.startDate }"
            />
            <div v-if="errors.startDate" class="invalid-feedback">
              {{ errors.startDate }}
            </div>
          </div>
          <div class="col-12 col-md-3">
            <label class="form-label">
              End Date <span class="text-danger">*</span>
            </label>
            <input
              :value="eventForm.endDate"
              @input="$emit('update:eventForm', { ...eventForm, endDate: $event.target.value })"
              type="date"
              class="form-control"
              :class="{ 'is-invalid': errors.endDate }"
            />
            <div v-if="errors.endDate" class="invalid-feedback">
              {{ errors.endDate }}
            </div>
          </div>
          <div class="col-12 col-md-3">
            <label class="form-label">Start Time</label>
            <input
              :value="eventForm.startTime"
              @input="$emit('update:eventForm', { ...eventForm, startTime: $event.target.value })"
              type="time"
              class="form-control"
            />
          </div>
          <div class="col-12 col-md-3">
            <label class="form-label">End Time</label>
            <input
              :value="eventForm.endTime"
              @input="$emit('update:eventForm', { ...eventForm, endTime: $event.target.value })"
              type="time"
              class="form-control"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Event Details Section -->
    <div class="card mb-3">
      <div class="card-header bg-light">
        <h6 class="mb-0">
          <i class="pi pi-info-circle me-2"></i>
          Event Details
        </h6>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label">Organizer</label>
            <input
              :value="eventForm.organizer"
              @input="$emit('update:eventForm', { ...eventForm, organizer: $event.target.value })"
              type="text"
              placeholder="Organizing company or person"
              class="form-control"
            />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">
              Capacity <span class="text-danger">*</span>
            </label>
            <input
              :value="eventForm.capacity"
              @input="$emit('update:eventForm', { ...eventForm, capacity: parseInt($event.target.value) || 0 })"
              type="number"
              min="1"
              class="form-control"
              :class="{ 'is-invalid': errors.capacity }"
            />
            <div v-if="errors.capacity" class="invalid-feedback">
              {{ errors.capacity }}
            </div>
          </div>
        </div>

        <div class="row g-3 mt-2">
          <div class="col-12 col-md-6">
            <label class="form-label">
              Event Type <span class="text-danger">*</span>
            </label>
            <select
              :value="eventForm.eventType"
              @change="$emit('update:eventForm', { ...eventForm, eventType: $event.target.value })"
              class="form-select"
              :class="{ 'is-invalid': errors.eventType }"
            >
              <option value="" disabled>Select event type</option>
              <option
                v-for="type in eventTypes"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
            <div v-if="errors.eventType" class="invalid-feedback">
              {{ errors.eventType }}
            </div>
          </div>
          <div class="col-12 col-md-6 d-flex align-items-end">
            <div class="form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="isFreeEvent"
                :checked="eventForm.isFree"
                @change="$emit('update:eventForm', { ...eventForm, isFree: $event.target.checked })"
              />
              <label class="form-check-label" for="isFreeEvent">
                This is a free event
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { EVENT_TYPES } from '../utils/eventFormUtils.js';
import { uploadImageToCloud } from '@/api/imageServices';

const props = defineProps({
  eventForm: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:eventForm', 'image-uploaded']);

const eventTypes = EVENT_TYPES;
const imageUploading = ref(false);
const imageUrl = ref('');

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB');
    return;
  }

  try {
    imageUploading.value = true;
    const formData = new FormData();
    formData.append('image', file);
    
    const result = await uploadImageToCloud(formData);
    imageUrl.value = result.data.secure_url;
    
    // Update the event form with the image URL
    emit('update:eventForm', { 
      ...props.eventForm, 
      imageUrl: result.data.secure_url 
    });
    
    emit('image-uploaded', result.data.secure_url);
  } catch (error) {
    console.error('Error uploading image:', error);
    alert('Failed to upload image. Please try again.');
  } finally {
    imageUploading.value = false;
  }
};
</script>

<style scoped>
.card-header {
  border-bottom: 1px solid #dee2e6;
}

.form-text {
  font-size: 0.875rem;
  color: #6c757d;
}

.pi {
  font-size: 1rem;
}
</style>
