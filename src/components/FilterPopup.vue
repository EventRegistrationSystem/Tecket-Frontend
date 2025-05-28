<template>
  <!-- Bootstrap Modal for Filter Popup -->
  <div v-if="showFilter" class="modal fade show d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header">
          <h5 class="modal-title">Filter Options</h5>
          <button type="button" class="btn-close" aria-label="Close" @click="closeFilter"></button>
        </div>
        <!-- Modal Body -->
        <div class="modal-body">
          <!-- Activity Type Section -->
          <div class="mb-3">
            <label class="form-label">Choose Activity</label>
            <div class="row">
              <div class="col-3" v-for="activity in activities" :key="activity.name">
                <div
                  class="card text-center clickable"
                  :class="{ 'border-primary': selectedActivity === activity.name }"
                  @click="selectActivity(activity.name)"
                >
                  <img :src="activity.image" class="card-img-top" :alt="activity.name" />
                  <div class="card-body p-2">
                    <p class="card-text">{{ activity.name }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="errors.selectedActivity" class="text-danger mt-1">
              {{ errors.selectedActivity }}
            </div>
          </div>

          <!-- Location Section -->
          <div class="mb-3">
            <label class="form-label">Location</label>
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                v-model="location"
                @blur="handleManualInput"
                placeholder="Enter location or select from map"
                :disabled="isGeocoding"
              />
              <button class="btn btn-outline-secondary" type="button" @click="toggleMap" :disabled="isGeocoding">
                Map
              </button>
            </div>
            <div v-if="errors.location" class="text-danger mt-1">
              {{ errors.location }}
            </div>
            <div v-if="isGeocoding" class="mt-1 text-muted">
              Loading...
            </div>
            <div v-if="showMap" ref="mapContainer" class="mt-2 map-container"></div>
          </div>

        </div>
        <!-- Modal Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="clearFilter">Clear</button>
          <button type="button" class="btn btn-primary" @click="applyFilter">Apply</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, nextTick } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Props and event emissions from parent component
const props = defineProps({
  showFilter: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits(["closeFilter", "applyFilter"]);

// Activity options data
const activities = ref([
  {
    name: "SPORTS", // Matches backend enum
    image: new URL("@/assets/Sport.png", import.meta.url).href, // Assuming Sport.png is suitable
  },
  {
    name: "MUSICAL", // Matches backend enum
    image: new URL("@/assets/Music.png", import.meta.url).href, // Assuming Music.png is suitable
  },
  {
    name: "SOCIAL", // Matches backend enum
    image: new URL("@/assets/Art.png", import.meta.url).href, // Placeholder, ideally a "Social.png"
  },
  {
    name: "VOLUNTEERING", // Matches backend enum
    image: new URL("@/assets/Food.png", import.meta.url).href, // Placeholder, ideally a "Volunteering.png"
  },
]);

const selectedActivity = ref("");
const location = ref("");
// minPrice and maxPrice removed

// Map state variables
const showMap = ref(false);
const mapContainer = ref(null);
const mapInstance = ref(null);
const marker = ref(null);
const isGeocoding = ref(false);

// Error messages
const errors = ref({
  selectedActivity: "",
  location: "",
  // minPrice and maxPrice errors removed
});

// Update selected activity and clear its error
const selectActivity = (activityName) => {
  selectedActivity.value = activityName;
  errors.value.selectedActivity = "";
};

// Reset all filter fields and remove map marker if present
const clearFilter = () => {
  selectedActivity.value = "";
  location.value = "";
  // minPrice and maxPrice reset removed
  errors.value = {
    selectedActivity: "",
    location: "",
  };
  if (marker.value && mapInstance.value) {
    mapInstance.value.removeLayer(marker.value);
    marker.value = null;
  }
};

// Validate price inputs
const validateInputs = () => {
  let isValid = true;
  errors.value.selectedActivity = "";
  errors.value.location = "";
  // Price validation removed
  return isValid;
};

// Apply filter conditions and emit to parent if valid
const applyFilter = async () => {
  if (validateInputs()) { // validateInputs now only checks activity and location if needed
    emit("applyFilter", {
      selectedActivity: selectedActivity.value,
      location: location.value,
      // minPrice and maxPrice removed from emitted data
    });
    closeFilter();
  }
};

const closeFilter = () => {
  emit("closeFilter");
};

// Toggle map display and initialize if necessary
const toggleMap = () => {
  showMap.value = !showMap.value;
  if (showMap.value) {
    nextTick(() => {
      initMap();
    });
  }
};

const initMap = () => {
  if (!mapInstance.value) {
    if (!mapContainer.value) return;
    mapInstance.value = L.map(mapContainer.value).setView([51.505, -0.09], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapInstance.value);
    mapInstance.value.on("click", onMapClick);
  } else {
    mapInstance.value.invalidateSize();
  }
};

// Handle map click to update marker and reverse geocode location
const onMapClick = async (e) => {
  const { lat, lng } = e.latlng;
  if (marker.value) {
    marker.value.setLatLng(e.latlng);
  } else {
    marker.value = L.marker(e.latlng).addTo(mapInstance.value);
  }
  try {
    const address = await reverseGeocode(lat, lng);
    location.value = address;
    errors.value.location = "";
  } catch (error) {
    console.error("Reverse Geocoding Error:", error);
    errors.value.location = "Unable to retrieve address.";
  }
  showMap.value = false;
};

const reverseGeocode = async (lat, lng) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
  );
  if (!response.ok) throw new Error("Network error");
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.display_name;
};

const geocodeAddress = async (address) => {
  const encodedAddress = encodeURIComponent(address);
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodedAddress}`
  );
  if (!response.ok) throw new Error("Network error");
  const data = await response.json();
  if (data.length === 0) throw new Error("No results found.");
  return {
    address: data[0].display_name,
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };
};

// Handle manual input in the location field and update map view accordingly
const handleManualInput = async () => {
  if (!location.value.trim()) {
    errors.value.location = "";
    return;
  }
  isGeocoding.value = true;
  try {
    const result = await geocodeAddress(location.value);
    location.value = result.address;
    errors.value.location = "";
    if (mapInstance.value) {
      mapInstance.value.setView([result.lat, result.lng], 13);
      if (marker.value) {
        marker.value.setLatLng([result.lat, result.lng]);
      } else {
        marker.value = L.marker([result.lat, result.lng]).addTo(mapInstance.value);
      }
    } else {
      showMap.value = true;
      await nextTick();
      initMap();
      mapInstance.value.setView([result.lat, result.lng], 13);
      if (marker.value) {
        marker.value.setLatLng([result.lat, result.lng]);
      } else {
        marker.value = L.marker([result.lat, result.lng]).addTo(mapInstance.value);
      }
    }
  } catch (error) {
    console.error("Geocoding Error:", error);
    errors.value.location =
      "Unable to find the entered address. Please try again.";
  } finally {
    isGeocoding.value = false;
  }
};

// Clean up map instance when component unmounts
onBeforeUnmount(() => {
  if (mapInstance.value) {
    mapInstance.value.remove();
  }
});
</script>

<style scoped>
/* Custom clickable style: replacing inline cursor style */
.clickable {
  cursor: pointer;
}

/* Define height for map container */
.map-container {
  height: 400px;
}
</style>
