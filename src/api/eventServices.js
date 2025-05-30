import httpClient from './httpClient';

// The handleResponse helper is no longer needed as Axios and its interceptors handle this.

/**
 * Fetch paginated list of events
 * @param {Object} params - Query parameters (page, limit, filters)
 * @returns {Promise<{ events: Array, pagination: Object }>} 
 */
export const fetchEvents = async (params = {}) => {
  try {
    const response = await httpClient.get('/events', { params });
    return response.data.data; 
  } catch (error) {
    console.error('Error fetching events:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Fetch event report by ID
 * @param {number|string} eventId
 * @returns {Promise<Object>} Event report data
 */
export const getEventReport = async (eventId) => {
  try {
    
    const response = await httpClient.get(`/events/${eventId}/report`);  
    return response.data; 

  } catch (error) {
    console.error(`Error fetching event report for ID ${eventId}:`, error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Fetch single event details by ID
 * @param {number|string} eventId
 * @returns {Promise<Object>} Event details
 */
export const fetchEventDetails = async (eventId) => {
  try {
    const response = await httpClient.get(`/events/${eventId}`);
    // Assuming backend response is { success: true, data: { ...eventDetails } }
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching event details for ID ${eventId}:`, error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Create a new event
 * @param {Object} eventData
 * @returns {Promise<Object>} Created event data
 */
export const createEvent = async (eventData) => {
  try {
    const response = await httpClient.post('/events', eventData);
    // Assuming backend response is { success: true, data: { ...createdEvent } }
    return response.data.data;
  } catch (error) {
    console.error('Error creating event:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Update an existing event
 * @param {number|string} eventId
 * @param {Object} updatedData
 * @returns {Promise<Object>} Updated event data
 */
export const updateEvent = async (eventId, updatedData) => {
  try {
    const response = await httpClient.put(`/events/${eventId}`, updatedData);
    // Assuming backend response is { success: true, data: { ...updatedEvent } }
    return response.data.data;
  } catch (error) {
    console.error(`Error updating event ID ${eventId}:`, error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Delete an event by ID
 * @param {number|string} eventId
 * @returns {Promise<string>} Success message or full response data
 */
export const deleteEvent = async (eventId) => {
  try {
    const response = await httpClient.delete(`/events/${eventId}`);
    // Assuming backend response is { success: true, message: 'Event deleted successfully' } or similar
    return response.data; // Return the whole data part which might include a message
  } catch (error) {
    console.error(`Error deleting event ID ${eventId}:`, error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};
