import httpClient from './httpClient';

// The API_BASE_URL is configured in httpClient.
// The handleResponse helper is no longer needed as Axios and its interceptors handle this.

// ==========================
// Event-Question-related APIs
// ==========================

/**
 * Fetch questions associated with an event.
 * @param {number|string} eventId - The ID of the event.
 * @returns {Promise<Array>} List of eventQuestion objects.
 */
export const fetchEventQuestions = async (eventId) => {
  try {
    const response = await httpClient.get(`/events/${eventId}/questions`);
    // Assuming backend response is { success: true, data: { eventQuestions: [] } } or similar
    return response.data.data.eventQuestions || response.data.data || []; // Adjust based on actual structure
  } catch (error) {
    console.error(`Error fetching questions for event ID ${eventId}:`, error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Bind a question to an event (create an EventQuestion).
 * @param {number|string} eventId - The ID of the event.
 * @param {Object} questionData - Data for binding the question, e.g., { questionId, isRequired, displayOrder }.
 * @returns {Promise<Object>} Created eventQuestion object.
 */
export const createEventQuestion = async (eventId, questionData) => {
  try {
    const response = await httpClient.post(`/events/${eventId}/questions`, questionData);
    // Assuming backend response is { success: true, data: { ...createdEventQuestion } }
    return response.data.data;
  } catch (error) {
    console.error(`Error creating event question for event ID ${eventId}:`, error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Update an existing EventQuestion (a question bound to an event).
 * @param {number|string} eventId - The ID of the event.
 * @param {number|string} eventQuestionId - The ID of the EventQuestion record to update.
 * @param {Object} updatedData - Data to update, e.g., { isRequired, displayOrder }.
 * @returns {Promise<Object>} Updated eventQuestion object.
 */
export const updateEventQuestion = async (eventId, eventQuestionId, updatedData) => {
  try {
    const response = await httpClient.put(`/events/${eventId}/questions/${eventQuestionId}`, updatedData);
    // Assuming backend response is { success: true, data: { ...updatedEventQuestion } }
    return response.data.data;
  } catch (error) {
    console.error(`Error updating event question ID ${eventQuestionId} for event ID ${eventId}:`, error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Remove a question binding from an event (delete an EventQuestion).
 * @param {number|string} eventId - The ID of the event.
 * @param {number|string} eventQuestionId - The ID of the EventQuestion record to delete.
 * @returns {Promise<Object>} Response data, typically a success message.
 */
export const deleteEventQuestion = async (eventId, eventQuestionId) => {
  try {
    const response = await httpClient.delete(`/events/${eventId}/questions/${eventQuestionId}`);
    // Assuming backend response is { success: true, message: '...' }
    return response.data;
  } catch (error) {
    console.error(`Error deleting event question ID ${eventQuestionId} for event ID ${eventId}:`, error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};
