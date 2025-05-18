import httpClient from './httpClient';

// The BASE_URL is configured in httpClient.
// The handleResponse helper is no longer needed as Axios and its interceptors handle this.

/**
 * Fetch all ticket types for a specific event.
 * Corresponds to: GET /events/:eventId/tickets
 * @param {number|string} eventId - The ID of the event.
 * @returns {Promise<Array>} Array of ticket objects.
 */
export const fetchTicketsForEvent = async (eventId) => {
  try {
    const response = await httpClient.get(`/events/${eventId}/tickets`);
    // Assuming backend response is { success: true, data: [...] } or { success: true, data: { tickets: [...] } }
    // Adjust based on actual backend structure. Let's assume it's response.data.data for consistency.
    return response.data.data || response.data; // Or specific like response.data.data.tickets
  } catch (error) {
    console.error(`Error fetching tickets for event ID ${eventId}:`, error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Fetch details for a specific ticket type of an event.
 * Corresponds to: GET /events/:eventId/tickets/:ticketId
 * @param {number|string} eventId - The ID of the event.
 * @param {number|string} ticketId - The ID of the ticket.
 * @returns {Promise<Object>} Ticket object.
 */
export const getTicketDetails = async (eventId, ticketId) => {
  try {
    const response = await httpClient.get(`/events/${eventId}/tickets/${ticketId}`);
    return response.data.data; // Assuming response.data.data contains the ticket object
  } catch (error) {
    console.error(`Error fetching ticket ID ${ticketId} for event ID ${eventId}:`, error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Create a new ticket type for an event.
 * Corresponds to: POST /events/:eventId/tickets
 * @param {number|string} eventId - The ID of the event.
 * @param {Object} ticketData - Data for the new ticket type.
 * @returns {Promise<Object>} The created ticket object.
 */
export const createTicketForEvent = async (eventId, ticketData) => {
  try {
    const response = await httpClient.post(`/events/${eventId}/tickets`, ticketData);
    return response.data.data; // Assuming response.data.data contains the created ticket
  } catch (error) {
    console.error(`Error creating ticket for event ID ${eventId}:`, error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Update an existing ticket type for an event.
 * Corresponds to: PUT /events/:eventId/tickets/:ticketId
 * @param {number|string} eventId - The ID of the event.
 * @param {number|string} ticketId - The ID of the ticket to update.
 * @param {Object} ticketData - Updated data for the ticket type.
 * @returns {Promise<Object>} The updated ticket object.
 */
export const updateTicketForEvent = async (eventId, ticketId, ticketData) => {
  try {
    const response = await httpClient.put(`/events/${eventId}/tickets/${ticketId}`, ticketData);
    return response.data.data; // Assuming response.data.data contains the updated ticket
  } catch (error) {
    console.error(`Error updating ticket ID ${ticketId} for event ID ${eventId}:`, error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Delete a ticket type for an event.
 * Corresponds to: DELETE /events/:eventId/tickets/:ticketId
 * @param {number|string} eventId - The ID of the event.
 * @param {number|string} ticketId - The ID of the ticket to delete.
 * @returns {Promise<Object>} Response data, typically a success message.
 */
export const deleteTicketForEvent = async (eventId, ticketId) => {
  try {
    const response = await httpClient.delete(`/events/${eventId}/tickets/${ticketId}`);
    return response.data; // Assuming response.data contains { success: true, message: '...' }
  } catch (error) {
    console.error(`Error deleting ticket ID ${ticketId} for event ID ${eventId}:`, error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Check availability for a specific ticket type of an event.
 * Corresponds to: GET /events/:eventId/tickets/:ticketId/availability
 * @param {number|string} eventId - The ID of the event.
 * @param {number|string} ticketId - The ID of the ticket.
 * @returns {Promise<Object>} Availability status object.
 */
export const checkTicketAvailability = async (eventId, ticketId) => {
  try {
    const response = await httpClient.get(`/events/${eventId}/tickets/${ticketId}/availability`);
    // Assuming backend response is { success: true, data: { available: boolean, availableQuantity: number, reason?: string } }
    return response.data.data;
  } catch (error) {
    console.error(`Error checking availability for ticket ID ${ticketId}, event ID ${eventId}:`, error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};
