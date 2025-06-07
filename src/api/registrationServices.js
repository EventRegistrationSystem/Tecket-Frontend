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

/**
 * Fetches all registrations system-wide (Admin view).
 *
 * @param {object} params - Query parameters for pagination, filtering, and search.
 * @param {number} [params.page] - The page number for pagination.
 * @param {number} [params.limit] - The number of items per page.
 * @param {string} [params.search] - Search term for primary registrant or attendees.
 * @param {string} [params.status] - Filter by registration status.
 * @param {number} [params.ticketId] - Filter by registrations including a specific ticket type.
 * @param {number} [params.eventId] - Filter for registrations of a specific event.
 * @param {number} [params.userId] - Filter for registrations made by a specific user.
 * @param {number} [params.participantId] - Filter for registrations involving a specific participant.
 * @returns {Promise<object>} The response data from the API, typically { data: [], pagination: {} }.
 * @throws {Error} If the API request fails.
 */
export const getSystemRegistrations = async (params = {}) => {
  try {
    const response = await httpClient.get('/registrations/admin/all-system-summary', { params })
    return response.data // Assuming backend returns { message, data: [], pagination: {} }
  } catch (error) {
    console.error('Error fetching system registrations:', error.response ? error.response.data : error.message)
    throw error
  }
}

/**
 * Fetches detailed information for a single registration.
 *
 * @param {string|number} registrationId - The ID of the registration.
 * @returns {Promise<object>} The response data from the API, containing full registration details.
 * @throws {Error} If the API request fails.
 */
export const getRegistrationDetails = async (registrationId) => {
  try {
    const response = await httpClient.get(`/registrations/${registrationId}`)
    return response.data // Assuming backend returns { message, data: { registrationDetails } }
  } catch (error) {
    console.error(`Error fetching registration details for ID ${registrationId}:`, error.response ? error.response.data : error.message)
    throw error
  }
}

/**
 * Updates the status of a specific registration.
 *
 * @param {string|number} registrationId - The ID of the registration to update.
 * @param {string} status - The new status for the registration (e.g., 'CONFIRMED', 'CANCELLED').
 * @returns {Promise<object>} The response data from the API, typically the updated registration details.
 * @throws {Error} If the API request fails.
 */
export const updateRegistrationStatus = async (registrationId, status) => {
  try {
    const response = await httpClient.patch(`/registrations/${registrationId}/status`, { status })
    return response.data
  } catch (error) {
    console.error(`Error updating status for registration ID ${registrationId}:`, error.response ? error.response.data : error.message)
    throw error
  }
}

/**
 * Sends an invoice email for a specific registration.
 *
 * @param {string|number} registrationId - The ID of the registration.
 * @param {object} invoiceData - The data required for the invoice email.
 * @param {string} invoiceData.email - The recipient's email address.
 * @param {string} invoiceData.eventName - The name of the event.
 * @param {string} invoiceData.startDateTime - The start date and time of the event.
 * @param {string} invoiceData.endDateTime - The end date and time of the event.
 * @param {string} invoiceData.location - The location of the event.
 * @returns {Promise<object>} The response data from the API.
 * @throws {Error} If the API request fails.
 */
export const sendInvoice = async (registrationId, invoiceData) => {
  try {
    const payload = { ...invoiceData, registrationId };
    const response = await httpClient.post('/email/invoice', payload);
    return response.data;
  } catch (error) {
    console.error(`Error sending invoice for registration ID ${registrationId}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};
