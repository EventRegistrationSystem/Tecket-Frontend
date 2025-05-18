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
