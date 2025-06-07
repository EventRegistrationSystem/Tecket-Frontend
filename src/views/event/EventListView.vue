<template>
  <div>
    <navbar />
    <div class="bg-custom pb-5">
      <div class="container mt-3">
        <div class="text-center pt-5 mb-4">
          <h2 class="fw-bold font-custom">Looking for your upcoming perfect event</h2>
        </div>

        <!-- Search, Sort, and Filter Controls -->
        <div class="row mb-4 align-items-center">
          <div class="col-md-6 mb-2 mb-md-0">
            <input type="text" class="form-control form-control-lg" placeholder="Search events..." aria-label="Search"
              v-model="searchText" />
          </div>
          <div class="col-md-6 d-flex justify-content-md-end justify-content-center">
            <div class="dropdown me-2">
              <button class="btn btn-primary dropdown-toggle" type="button" id="sortDropdown" data-bs-toggle="dropdown"
                aria-expanded="false">
                Sort by: {{ sortOptionLabel }}
              </button>
              <ul class="dropdown-menu" aria-labelledby="sortDropdown">
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="sortOption = 'time'">
                    Sort by Start Time
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="sortOption = 'name'">
                    Sort by Name
                  </a>
                </li>
              </ul>
            </div>
            <button class="btn btn-secondary" @click="showFilter = true">
              <i class="bi bi-funnel me-1"></i>
              Filter
            </button>
          </div>
        </div>

        <!-- Events Section Header -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="fw-bold font-custom mb-0">Events</h4>
          <div class="btn-group">
            <button type="button" class="btn btn-outline-secondary" :class="{ active: viewMode === 'grid' }"
              @click="setViewMode('grid')" title="Grid view">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-grid"
                viewBox="0 0 16 16">
                <path
                  d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z" />
              </svg>
            </button>
            <button type="button" class="btn btn-outline-secondary" :class="{ active: viewMode === 'list' }"
              @click="setViewMode('list')" title="List view">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list-task"
                viewBox="0 0 16 16">
                <path fill-rule="evenodd"
                  d="M2 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5zM3 3H2v1h1z" />
                <path
                  d="M5 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M5.5 7a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1zm0 4a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1z" />
                <path fill-rule="evenodd"
                  d="M1.5 7a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5zM2 7h1v1H2zm0 3.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm1 .5H2v1h1z" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="loading" class="text-center mt-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="error" class="alert alert-danger text-center mt-5">
          {{ error }}
        </div>
        <div v-else class="row">
          <!-- Grid View -->
          <div class="col-md-4 mb-4" v-for="event in sortedEvents" :key="event.id" v-if="viewMode === 'grid'">
            <div class="card h-100 event-grid-card">
              <router-link :to="{ name: 'EventDetail', params: { id: event.id } }">
                <img :src="event.imageUrl || defaultBanner" class="card-img-top event-grid-card-img"
                  alt="Event Banner" />
              </router-link>
              <div class="card-body d-flex flex-column">
                <router-link :to="{ name: 'EventDetail', params: { id: event.id } }" class="text-decoration-none">
                  <h5 class="card-title event-grid-title mb-2">{{ event.name }}</h5>
                </router-link>
                <p class="card-text event-grid-date-time mb-0">
                  <small>{{ formatDate(event.startDateTime, 'date') }} at {{ formatDate(event.startDateTime, 'time')
                    }}</small>
                </p>
              </div>
            </div>
          </div>

          <!-- List View -->
          <table class="table table-hover" v-if="viewMode === 'list'">
            <thead>
              <tr>
                <th scope="col">Event Name</th>
                <th scope="col">Date</th>
                <th scope="col">Time</th>
                <th scope="col">Location</th>
                <th scope="col">Event Type</th>
                <th scope="col">Organizer</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in sortedEvents" :key="event.id" style="cursor: pointer"
                @click="navigateToDetails(event.id)">
                <th scope="row" class="fw-semibold text-primary">{{ event.name }}</th>
                <td>{{ formatDate(event.startDateTime, 'date') }}</td>
                <td>
                  {{ formatDate(event.startDateTime, 'time') }}
                  <span
                    v-if="event.endDateTime && formatDate(event.startDateTime, 'time') !== formatDate(event.endDateTime, 'time')">
                    - {{ formatDate(event.endDateTime, 'time') }}
                  </span>
                </td>
                <td>{{ event.location || 'Online' }}</td>
                <td>{{ event.eventType || 'General' }}</td>
                <td>{{ getOrganizerName(event.organizer) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="!sortedEvents.length && !loading" class="col-12 text-center mt-5">
            <p>No events found matching your criteria.</p>
          </div>
        </div>
      </div>

      <FilterPopup :showFilter="showFilter" @closeFilter="closeFilter" @applyFilter="handleApplyFilter" />
    </div>
    <Footer />
  </div>
</template>

<script setup>
import navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
import FilterPopup from "@/components/FilterPopup.vue";
import { ref, computed, onMounted, watch } from "vue";
import { useUserStore } from "@/store/userStore";
import { useRouter } from 'vue-router';
import { fetchEvents } from "@/api/eventServices.js"; // Import the service

const events = ref([]);
const loading = ref(true);
const error = ref(null);
const viewMode = ref("grid");
const router = useRouter();


const searchText = ref("");
const sortOption = ref("time");
const sortOptionLabel = computed(() =>
  sortOption.value === "time" ? "Start Time" : "Name"
);

const filterCriteria = ref({
  selectedActivity: "",
  location: "",
});

const defaultBanner = "https://placehold.co/288x180?text=Event";
const userStore = useUserStore();

const fetchAndSetEvents = async () => {
  loading.value = true;
  error.value = null;
  try {
    const apiParams = {};
    if (searchText.value) {
      apiParams.search = searchText.value;
    }
    if (filterCriteria.value.selectedActivity) {
      apiParams.eventType = filterCriteria.value.selectedActivity;
    }
    if (filterCriteria.value.location) {
      apiParams.location = filterCriteria.value.location;
    }

    const responseData = await fetchEvents(apiParams, { isPublicView: true });

    if (responseData && Array.isArray(responseData.events)) {
      events.value = responseData.events;
    } else {
      events.value = [];
      console.warn("Unexpected API response structure from fetchEvents service:", responseData);
    }

  } catch (err) {
    console.error("Error getting list of events：", err);
    error.value = err.response?.data?.message || err.message || "Failed to load events.";
    events.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAndSetEvents();
});

watch(searchText, () => {
  fetchAndSetEvents();
});

watch(filterCriteria, () => {
  fetchAndSetEvents();
}, { deep: true });



const sortedEvents = computed(() => {
  return [...events.value].sort((a, b) => {
    if (sortOption.value === "time") {
      return new Date(a.startDateTime) - new Date(b.startDateTime);
    } else if (sortOption.value === "name") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });
});

const showFilter = ref(false);
const closeFilter = () => (showFilter.value = false);

const handleApplyFilter = (criteria) => {
  filterCriteria.value = {
    selectedActivity: criteria.selectedActivity || "",
    location: criteria.location || "",
  };
  closeFilter();
};

const formatDate = (dateStr, type) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (type === 'date') {
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  } else if (type === 'time') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleString();
};

const getOrganizerName = (organizer) => {
  if (!organizer) return 'N/A';
  if (typeof organizer === 'string') {
    try {
      const parsedOrganizer = JSON.parse(organizer);
      return `${parsedOrganizer.firstName || ''} ${parsedOrganizer.lastName || ''}`.trim() || 'N/A';
    } catch (e) {
      console.error("Failed to parse organizer JSON string:", organizer, e);
      return 'N/A';
    }
  }
  return `${organizer.firstName || ''} ${organizer.lastName || ''}`.trim() || 'N/A';
};

function setViewMode(mode) {
  viewMode.value = mode;
}

function navigateToDetails(itemId) {
  router.push({ name: "EventDetail", params: { id: itemId } });
}
</script>

<style scoped>
.bg-custom {
  background-color: #fff;
  /* White background for the page content area */
  min-height: 100vh;
}

.font-custom {
  font-family: "Font", sans-serif;
}

.pl-custom {
  padding-left: 2%;
}

.btn.active {
  background-color: #007bff;
  color: white;
}

/* Grid Card Styling */
.event-grid-card {
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
  background-color: #fff;
}

.event-grid-card:hover {
  transform: translateY(-5px);
}

.event-grid-card-img {
  height: 180px;
  object-fit: cover;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.event-grid-card .card-body {
  padding: 1rem;
}

.event-grid-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
}

.event-grid-date-time {
  font-size: 0.85rem;
  color: #555;
}

/* Ensure filter button can have icon */
.btn-secondary i {
  margin-right: .25rem;
}
</style>
