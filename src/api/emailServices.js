import httpClient from './httpClient';


export const sendEmail = async (data) => {
  try {
    const response = await httpClient.post('/email', data);

    return response.data;
  } catch (error) {
    console.error('Error creating user:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

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