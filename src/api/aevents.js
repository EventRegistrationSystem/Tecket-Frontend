// src/api/aevents.js
import { authFetch } from './authRefresh.js';
import { BASE_URL } from './auth.js';

/**
 * Helper: Parse JSON and throw errors uniformly
 * @param {Response} res
 * @returns {Promise<Object>} json data or empty object
 */
const handleResponse = async (res) => {
  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    // 解析错误信息
    const errorText = contentType.includes('application/json')
      ? (await res.json()).message
      : await res.text();
    throw new Error(errorText || `Request failed with status ${res.status}`);
  }

  // 返回 JSON 或空对象
  if (contentType.includes('application/json')) {
    return await res.json();
  }
  return {};
};

/**
 * Fetch paginated list of events
 * @param {Object} params - Query parameters (page, limit, filters)
 * @returns {Promise<{ events: Array, pagination: Object }>} 
 */
export const fetchEvents = async (params = {}) => {
  const url = new URL(`${BASE_URL}/events`);
  Object.entries(params).forEach(([key, val]) => {
    if (val != null) url.searchParams.append(key, String(val));
  });

  const res = await authFetch(url.toString());
  const json = await handleResponse(res);
  return {
    events: json.data.events,
    pagination: json.data.pagination
  };
};

/**
 * Fetch single event details by ID
 * @param {number|string} eventId
 * @returns {Promise<Object>} Event details
 */
export const fetchEventDetails = async (eventId) => {
  const res = await authFetch(`${BASE_URL}/events/${eventId}`);
  const json = await handleResponse(res);
  return json.data;
};

/**
 * Create a new event
 * @param {Object} eventData
 * @returns {Promise<Object>} Created event data
 */
export const createEvent = async (eventData) => {
  const res = await authFetch(`${BASE_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData)
  });
  const json = await handleResponse(res);
  return json.data;
};

/**
 * Update an existing event
 * @param {number|string} eventId
 * @param {Object} updatedData
 * @returns {Promise<Object>} Updated event data
 */
export const updateEvent = async (eventId, updatedData) => {
  const res = await authFetch(`${BASE_URL}/events/${eventId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData)
  });
  const json = await handleResponse(res);
  return json.data;
};

/**
 * Delete an event by ID
 * @param {number|string} eventId
 * @returns {Promise<string>} Success message
 */
export const deleteEvent = async (eventId) => {
  const res = await authFetch(`${BASE_URL}/events/${eventId}`, {
    method: 'DELETE'
  });
  const json = await handleResponse(res);
  return json.message || 'Event deleted successfully';
};
