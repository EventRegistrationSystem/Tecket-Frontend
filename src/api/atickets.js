// src/api/atickets.js
import { authFetch } from './authRefresh.js';
import { BASE_URL } from './auth.js';

/**
 * Helper: Parse JSON and throw errors uniformly
 * @param {Response} res
 * @returns {Promise<Object>} json
 */

const handleResponse = async (res) => {
  const contentType = res.headers.get('content-type') || ''

  if (!res.ok) {

    const errorText = contentType.includes('application/json')
      ? (await res.json()).message
      : await res.text()
    throw new Error(errorText || `Request failed with status ${res.status}`)
  }


  if (contentType.includes('application/json')) {
    return res.json()
  } else {

    return {}
  }
}

/**
 * Get all ticket types for an event
 */
export const fetchTicketTypes = async (eventId) => {
  const res = await authFetch(`${BASE_URL}/events/${eventId}/tickets`);
  const json = await handleResponse(res);
  return json.data;
};

/**
 * Create a new ticket type
 */
export const createTicketType = async (eventId, ticketData) => {
  const res = await authFetch(
    `${BASE_URL}/events/${eventId}/tickets`,
    {
      method: 'POST',
      body: JSON.stringify(ticketData)
    }
  );
  const json = await handleResponse(res);
  return json.data;
};

/**
 * Update an existing ticket type
 */
export const updateTicketType = async (eventId, ticketId, ticketData) => {
  const res = await authFetch(
    `${BASE_URL}/events/${eventId}/tickets/${ticketId}`,
    {
      method: 'PUT',
      body: JSON.stringify(ticketData)
    }
  );
  const json = await handleResponse(res);
  return json.data;
};

/**
 * Delete a ticket type
 */
export const deleteTicketType = async (eventId, ticketId) => {
  const res = await authFetch(
    `${BASE_URL}/events/${eventId}/tickets/${ticketId}`,
    { method: 'DELETE' }
  );
  const json = await handleResponse(res);
  return json.message || 'Ticket type deleted successfully';
};

