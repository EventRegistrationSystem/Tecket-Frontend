// src/api/aevents.js
import { authFetch } from './authRefresh.js';
import { BASE_URL } from './auth.js';

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

/**
 * Fetch paginated list of events
 */
export const fetchEvents = async (params = {}) => {
  const requestUrl = new URL(`${BASE_URL}/events`);
  Object.entries(params).forEach(([key, val]) => {
    if (val != null) requestUrl.searchParams.append(key, String(val));
  });

  const res = await authFetch(requestUrl.toString());
  const json = await handleResponse(res);
  return {
    events: json.data.events,
    pagination: json.data.pagination
  };
};

/**
 * Fetch single event details
 */
export const fetchEventDetails = async (eventId) => {
  const res = await authFetch(`${BASE_URL}/events/${eventId}`);
  const json = await handleResponse(res);
  return json.data;
};

/**
 * Create a new event
 * @param {Object} eventData
 * @returns {Promise<Object>} Created event
 */
export const createEvent = async (eventData) => {
  const res = await authFetch(`${API_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData)
  });
  const json = await handleResponse(res);
  return json.data;
};

/**
 * Update existing event
 * @param {number} eventId
 * @param {Object} updatedData
 * @returns {Promise<Object>} Updated event
 */
export const updateEvent = async (eventId, updatedData) => {
  const res = await authFetch(`${API_URL }/events/${eventId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData)
  });
  const json = await handleResponse(res);
  return json.data;
};

/**
 * Delete an event
 * @param {number} eventId
 * @returns {Promise<string>} Success message
 */
export const deleteEvent = async (eventId) => {
  const res = await authFetch(`${API_URL }/events/${eventId}`, {
    method: 'DELETE'
  });
  const json = await handleResponse(res);
  return json.message || 'Event deleted successfully';
};


