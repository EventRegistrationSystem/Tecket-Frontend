import httpClient from './httpClient'

/**
 * Creates a new registration.
 *
 * @param {object} registrationData - The data for creating the registration.
 * @param {number} registrationData.eventId - The ID of the event.
 * @param {Array<{ ticketId: number, quantity: number }>} registrationData.tickets - Array of selected tickets.
 * @param {Array<object>} registrationData.participants - Array of participant details, including their responses.
 * @returns {Promise<object>} The response data from the API.
 * @throws {Error} If the API request fails.
 */
export const createRegistration = async (registrationData) => {
  try {
    const response = await httpClient.post('/registrations', registrationData)
    return response.data
  } catch (error) {
    console.error('Error creating registration:', error.response ? error.response.data : error.message)
    throw error
  }
}

/**
 * Fetches registrations for a specific event.
 *
 * @param {string|number} eventId - The ID of the event.
 * @param {object} params - Query parameters for pagination, filtering, and search.
 * @param {number} [params.page] - The page number for pagination.
 * @param {number} [params.limit] - The number of items per page.
 * @param {string} [params.search] - Search term for primary registrant or attendees.
 *   (Searches across primary registrant's and attendees' names and emails)
 * @param {string} [params.status] - Filter by registration status (e.g., 'CONFIRMED', 'PENDING', 'CANCELLED').
 * @param {number} [params.ticketId] - Filter by registrations that include a specific ticket type.
 * @returns {Promise<object>} The response data from the API, typically { data: [], pagination: {} }.
 * @throws {Error} If the API request fails.
 */
export const getRegistrationsForEvent = async (eventId, params = {}) => {
  try {
    const response = await httpClient.get(`/events/${eventId}/registrations`, { params })
    return response.data // Assuming backend returns { message, data: [], pagination: {} }
  } catch (error) {
    console.error(`Error fetching registrations for event ${eventId}:`, error.response ? error.response.data : error.message)
    throw error
  }
}
