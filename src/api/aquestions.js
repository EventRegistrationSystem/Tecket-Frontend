// src/api/aquestions.js
import { authFetch } from './authRefresh.js';

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Helper: Parse JSON and throw errors uniformly
 * @param {Response} res
 * @returns {Promise<Object>} json
 */
const handleResponse = async (res) => {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || json.error || `Request failed with status ${res.status}`);
  }
  return json;
};

// ==========================
// Event-Question-related APIs
// ==========================

/**
 * Fetch questions associated with an event
 * @param {number} eventId
 * @returns {Promise<Array>} List of eventQuestion objects
 */
export const fetchEventQuestions = async (eventId) => {
  const res = await authFetch(`${API_BASE_URL}/events/${eventId}/questions`);
  const json = await handleResponse(res);
  return json.data.eventQuestions;
};

/**
 * Bind a question to an event
 * @param {number} eventId
 * @param {Object} questionData - { questionId, isRequired, displayOrder }
 * @returns {Promise<Object>} Created eventQuestion object
 */
export const createEventQuestion = async (eventId, questionData) => {
  const res = await authFetch(`${API_BASE_URL}/events/${eventId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(questionData)
  });
  const json = await handleResponse(res);
  return json.data;
};

/**
 * Update a bound question on an event
 * @param {number} eventId
 * @param {number} eventQuestionId
 * @param {Object} updatedData - { isRequired, displayOrder }
 * @returns {Promise<Object>} Updated eventQuestion object
 */
export const updateEventQuestion = async (eventId, eventQuestionId, updatedData) => {
  const res = await authFetch(
    `${API_BASE_URL}/events/${eventId}/questions/${eventQuestionId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    }
  );
  const json = await handleResponse(res);
  return json.data;
};

/**
 * Remove a question binding from an event
 * @param {number} eventId
 * @param {number} eventQuestionId
 * @returns {Promise<string>} Success message
 */
export const deleteEventQuestion = async (eventId, eventQuestionId) => {
  const res = await authFetch(
    `${API_BASE_URL}/events/${eventId}/questions/${eventQuestionId}`,
    { method: 'DELETE' }
  );
  const json = await handleResponse(res);
  return json.message || 'Event question deleted successfully';
};
