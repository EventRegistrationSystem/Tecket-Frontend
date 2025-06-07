<template>
  <div class="mb-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h6 class="mb-1">Registration Questions</h6>
        <p class="small text-muted mb-0">
          Create questions that attendees will answer during registration
        </p>
      </div>
      <button
        @click="addQuestion"
        type="button"
        class="btn btn-primary btn-sm"
      >
        <i class="pi pi-plus me-1"></i>
        Add Question
      </button>
    </div>

    <div v-if="!questions.length" class="alert alert-light text-center">
      <div class="text-muted mb-2">
        <i class="pi pi-list-alt" style="font-size: 2rem;"></i>
      </div>
      <h6 class="mb-2">No questions added yet</h6>
      <p class="small text-muted mb-3">
        Add questions to collect information from your attendees during registration
      </p>
      <button
        @click="addQuestion"
        type="button"
        class="btn btn-primary btn-sm"
      >
        <i class="pi pi-plus me-1"></i>
        Add First Question
      </button>
    </div>

    <div v-else>
      <div
        v-for="(question, index) in questions"
        :key="question.id"
        class="card mb-3"
      >
        <!-- Question header -->
        <div class="card-header bg-light">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <i class="pi pi-bars text-muted me-2" style="cursor: move"></i>
              <span class="fw-semibold">Question {{ index + 1 }}</span>
              <span
                v-if="question.required"
                class="badge bg-danger ms-2"
              >
                Required
              </span>
            </div>
            <div class="d-flex align-items-center">
              <span class="badge bg-secondary me-2">
                {{ getQuestionTypeLabel(question.type) }}
              </span>
              <button
                @click="removeQuestion(index)"
                type="button"
                class="btn btn-link text-danger p-0"
              >
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Question content -->
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">Question Text</label>
            <input
              :value="question.text"
              @input="updateQuestion(index, 'text', $event.target.value)"
              type="text"
              placeholder="Enter your question"
              class="form-control"
              :class="{ 'is-invalid': errors[`question_${index}_text`] }"
            />
            <div v-if="errors[`question_${index}_text`]" class="invalid-feedback">
              {{ errors[`question_${index}_text`] }}
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Question Type</label>
            <select 
              :value="question.type" 
              @change="updateQuestion(index, 'type', $event.target.value)"
              class="form-select"
            >
              <option value="text">Text Input</option>
              <option value="select">Dropdown</option>
              <option value="checkbox">Checkboxes (multiple selection)</option>
            </select>
          </div>

          <!-- Options for select or checkbox types -->
          <div v-if="['select', 'checkbox'].includes(question.type)" class="mb-3">
            <label class="form-label">Options</label>
            <div v-if="errors[`question_${index}_options`]" class="alert alert-danger alert-sm p-2 mb-2">
              {{ errors[`question_${index}_options`] }}
            </div>
            <div
              v-for="(option, optionIndex) in question.options"
              :key="optionIndex"
              class="d-flex align-items-center mb-2"
            >
              <input
                :value="option"
                @input="updateQuestionOption(index, optionIndex, $event.target.value)"
                type="text"
                placeholder="Option text"
                class="form-control"
              />
              <button
                @click="removeOption(index, optionIndex)"
                type="button"
                class="btn btn-link text-danger ms-2"
                :disabled="question.options.length <= 1"
              >
                <i class="pi pi-times"></i>
              </button>
            </div>
            <button
              @click="addOption(index)"
              type="button"
              class="btn btn-link text-primary p-0"
            >
              <i class="pi pi-plus me-1"></i>
              Add Option
            </button>
          </div>

          <!-- Additional settings -->
          <div class="d-flex align-items-center gap-3">
            <div class="form-check">
              <input
                :checked="question.required"
                @change="updateQuestion(index, 'required', $event.target.checked)"
                type="checkbox"
                class="form-check-input"
                :id="`required_${index}`"
              />
              <label class="form-check-label" :for="`required_${index}`">
                Required
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getDefaultQuestion, QUESTION_TYPES } from '../utils/eventFormUtils.js';

const props = defineProps({
  questions: {
    type: Array,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:questions']);

const getQuestionTypeLabel = (type) => {
  const questionType = QUESTION_TYPES.find(t => t.value === type);
  return questionType ? questionType.label : type;
};

import { createEventQuestion, updateEventQuestion, deleteEventQuestion } from '@/api/questionServices';

const addQuestion = async () => {
  const newQuestion = getDefaultQuestion();
  newQuestion.order = props.questions.length + 1;
  if (props.isEditMode && props.eventForm.id) {
    try {
      const createdQuestion = await createEventQuestion(props.eventForm.id, newQuestion);
      emit('update:questions', [...props.questions, createdQuestion]);
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Failed to add question. Please try again.');
    }
  } else {
    emit('update:questions', [...props.questions, newQuestion]);
  }
};

const removeQuestion = async (index) => {
  const questionToRemove = props.questions[index];
  if (props.isEditMode && props.eventForm.id && questionToRemove.backendEventQuestionId) {
    try {
      await deleteEventQuestion(props.eventForm.id, questionToRemove.backendEventQuestionId);
      const newQuestions = props.questions.filter((_, i) => i !== index);
      emit('update:questions', newQuestions);
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question. Please try again.');
    }
  } else {
    const newQuestions = props.questions.filter((_, i) => i !== index);
    emit('update:questions', newQuestions);
  }
};

const updateQuestion = async (index, field, value) => {
  const newQuestions = [...props.questions];
  newQuestions[index] = { ...newQuestions[index], [field]: value };
  
  // Reset options when changing question type
  if (field === 'type') {
    if (['select', 'checkbox'].includes(value)) {
      newQuestions[index].options = ['Option 1'];
    } else {
      newQuestions[index].options = [];
    }
  }
  
  emit('update:questions', newQuestions);

  const updatedQuestion = newQuestions[index];
  if (props.isEditMode && props.eventForm.id && updatedQuestion.backendEventQuestionId) {
    try {
      await updateEventQuestion(props.eventForm.id, updatedQuestion.backendEventQuestionId, updatedQuestion);
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question. Please try again.');
    }
  }
};

const updateQuestionOption = (questionIndex, optionIndex, value) => {
  const newQuestions = [...props.questions];
  newQuestions[questionIndex].options[optionIndex] = value;
  emit('update:questions', newQuestions);
  
  const updatedQuestion = newQuestions[questionIndex];
  if (props.isEditMode && props.eventForm.id && updatedQuestion.backendEventQuestionId) {
    try {
      updateEventQuestion(props.eventForm.id, updatedQuestion.backendEventQuestionId, updatedQuestion);
    } catch (error) {
      console.error('Error updating question option:', error);
      alert('Failed to update question option. Please try again.');
    }
  }
};

const addOption = (questionIndex) => {
  const newQuestions = [...props.questions];
  const optionCount = newQuestions[questionIndex].options.length;
  newQuestions[questionIndex].options.push(`Option ${optionCount + 1}`);
  emit('update:questions', newQuestions);

  const updatedQuestion = newQuestions[questionIndex];
  if (props.isEditMode && props.eventForm.id && updatedQuestion.backendEventQuestionId) {
    try {
      updateEventQuestion(props.eventForm.id, updatedQuestion.backendEventQuestionId, updatedQuestion);
    } catch (error) {
      console.error('Error adding question option:', error);
      alert('Failed to add question option. Please try again.');
    }
  }
};

const removeOption = (questionIndex, optionIndex) => {
  const newQuestions = [...props.questions];
  if (newQuestions[questionIndex].options.length > 1) {
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    emit('update:questions', newQuestions);

    const updatedQuestion = newQuestions[questionIndex];
    if (props.isEditMode && props.eventForm.id && updatedQuestion.backendEventQuestionId) {
      try {
        updateEventQuestion(props.eventForm.id, updatedQuestion.backendEventQuestionId, updatedQuestion);
      } catch (error) {
        console.error('Error removing question option:', error);
        alert('Failed to remove question option. Please try again.');
      }
    }
  }
};
</script>

<style scoped>
.card-header {
  border-bottom: 1px solid #dee2e6;
}

.badge {
  font-size: 0.75rem;
}

.alert-sm {
  padding: 0.5rem;
  font-size: 0.875rem;
}

.pi {
  font-size: 1rem;
}
</style>
