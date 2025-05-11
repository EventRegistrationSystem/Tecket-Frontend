// /src/api/locations.js
/**
 * Fetches the list of available event venues/locations from the backend.
 * @returns {Promise<Array<string>>} A promise that resolves to an array of location names.
 */
export const fetchLocations = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_API_BASE_URL + `/locations`)
    if (!response.ok) {
      throw new Error(`Failed to fetch locations, status: ${response.status}`)
    }
    // Assuming backend returns { data: { locations: [...] } }
    const json = await response.json()
    return Array.isArray(json.data.locations) ? json.data.locations : []
  } catch (error) {
    console.error('Error fetching locations:', error)
    return []
  }
}
