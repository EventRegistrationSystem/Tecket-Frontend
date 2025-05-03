import { authFetch } from './authRefresh.js';

const API_BASE_URL = 'https://eventregistrationsystem-backend.onrender.com/api';
const url = import.meta.env.VITE_API_BASE_URL

/**
 * Parse the response and throw errors uniformly
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
// Ticket-related APIs
// ==========================

/**
 * Get all ticket types for a specified event
 * @param {number} eventId
 * @returns {Promise<Array>} Ticket[]
 */
export const fetchTicketTypes = async (eventId) => {
  const res = await authFetch(`${url}/events/${eventId}/tickets`);
  const json = await handleResponse(res);
  return json.data;
};

/**
 * Create a new ticket type
 * @param {number} eventId
 * @param {Object} ticketData
 * @returns {Promise<Object>} Ticket
 */
export const createTicketType = async (eventId, ticketData) => {
  const res = await authFetch(`${url}/events/${eventId}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData)
  });
  const json = await handleResponse(res);
  return json.data;
};

/**
 * Update existing ticket types
 * @param {number} eventId
 * @param {number} ticketId
 * @param {Object} ticketData
 * @returns {Promise<Object>} Ticket
 */
export const updateTicketType = async (eventId, ticketId, ticketData) => {
  const res = await authFetch(`${url}/events/${eventId}/tickets/${ticketId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData)
  });
  const json = await handleResponse(res);
  return json.data;
};

/**
 * Delete the specified ticket type
 * @param {number} eventId
 * @param {number} ticketId
 * @returns {Promise<string>} Delete Success Message
 */
export const deleteTicketType = async (eventId, ticketId) => {
  const res = await authFetch(`${url}/events/${eventId}/tickets/${ticketId}`, {
    method: 'DELETE'
  });
  const json = await handleResponse(res);
  return json.message || 'Ticket type deleted successfully';
};
