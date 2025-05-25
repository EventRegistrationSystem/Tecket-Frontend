<template>
  <div>
    <navbar />
    <div class="bg-custom">
      <div class="container mt-3">
        <h4 class="fw-bold pt-5 ms-5 font-custom">
          Looking for your upcoming perfect event
        </h4>
        <div class="input-group row ps-5 mt-4">
          <div class="col-4 pl-custom">
            <input
              type="text"
              class="form-control"
              placeholder="Search"
              aria-label="Search"
              v-model="searchText"
            />
          </div>
          <div class="col-4"></div>
        </div>

        <!-- Sorting and Filter Controls -->
        <div class="d-flex justify-content-center my-3">
          <div class="dropdown me-3">
            <button
              class="btn btn-primary dropdown-toggle"
              type="button"
              id="sortDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
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
            Select Event Filter
          </button>
        </div>

        <div class="container-fluid mb-3">
          <div class = "d-flex ">
            <div class = "">
              <span class="fw-bold ms-lg-5 font-custom" style = "font-size: 30px">Events</span>
            </div>
            <div class = "">
              <span></span>
            </div>
            <div class = "ms-auto">
              <div class="btn-group">
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  style=""
                  :class="{ active: viewMode === 'grid' }"
                  @click="setViewMode('grid')"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-grid"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z"
                    ></path>
                  </svg>
                  <span class="visually-hidden">Button</span>
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  :class="{ active: viewMode === 'list' }"
                  @click="setViewMode('list')"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-list-task"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M2 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5zM3 3H2v1h1z"
                    ></path>
                    <path
                      d="M5 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M5.5 7a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1zm0 4a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1z"
                    ></path>
                    <path
                      fill-rule="evenodd"
                      d="M1.5 7a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5zM2 7h1v1H2zm0 3.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm1 .5H2v1h1z"
                    ></path>
                  </svg>
                  <span class="visually-hidden">Button</span>
                </button>
              </div>
            </div>
          </div>
        
        </div>

        <div v-if="loading" class="text-center mt-5">Data loading...</div>
        <div v-else-if="error" class="text-center mt-5 text-danger">
          Data loading failed, please try again later!
        </div>
        <div v-else class="row">
          <!-- Grid View -->
          <div
            class="col-md-4 mb-4" 
            v-for="event in sortedEvents"
            :key="event.id"
            v-if="viewMode === 'grid'"
          >
            <div class="card h-100 event-grid-card">
              <router-link :to="{ name: 'EventDetail', params: { id: event.id } }">
                <img
                  :src="event.banner || defaultBanner"
                  class="card-img-top event-grid-card-img"
                  alt="Event Banner"
                />
              </router-link>
              <div class="card-body d-flex flex-column">
                <router-link
                  :to="{ name: 'EventDetail', params: { id: event.id } }"
                  class="text-decoration-none"
                >
                  <h5 class="card-title event-grid-title mb-2">{{ event.name }}</h5>
                </router-link>
                <p class="card-text event-grid-date-time mb-0">
                  <small>{{ formatDate(event.startDateTime, 'date') }} at {{ formatDate(event.startDateTime, 'time') }}</small>
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
              <tr
                v-for="event in sortedEvents"
                :key="event.id"
                style="cursor: pointer"
                @click="navigateToDetails(event.id)"
              >
                <th scope="row" class="fw-semibold text-primary">{{ event.name }}</th>
                <td>{{ formatDate(event.startDateTime, 'date') }}</td>
                <td>
                  {{ formatDate(event.startDateTime, 'time') }}
                  <span v-if="event.endDateTime && formatDate(event.startDateTime, 'time') !== formatDate(event.endDateTime, 'time')">
                    - {{ formatDate(event.endDateTime, 'time') }}
                  </span>
                </td>
                <td>{{ event.location || 'Online' }}</td>
                <td>{{ event.eventType || 'General' }}</td>
                <td>{{ getOrganizerName(event.organizer) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Filter popup component -->
      <FilterPopup
        :showFilter="showFilter"
        @closeFilter="closeFilter"
        @applyFilter="handleApplyFilter"
      />
    </div>
  </div>
</template>

<script setup>
import navbar from "@/components/Navbar.vue";
import FilterPopup from "@/components/FilterPopup.vue";
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/store/userStore";
import { useRouter } from 'vue-router';

const events = ref([]);
const loading = ref(true);
const error = ref(null);
const viewMode = ref("grid");
const router = useRouter();



function setViewMode(mode) {
  viewMode.value = mode;
  console.log(viewMode.value);
}

function navigateToDetails(itemId) {
  router.push({ name: "EventDetail", params: { id: itemId } });
}

// Text for the search box
const searchText = ref("");

// Current sorting option: "time" or "name".
const sortOption = ref("time");
const sortOptionLabel = computed(() =>
  sortOption.value === "time" ? "Start Time" : "Name"
);

// Filter conditions (this example only demonstrates eventType filtering, which can be expanded upon)
const filterCriteria = ref({
  selectedActivity: "",
  minPrice: 0,
  maxPrice: Infinity
});

const defaultBanner = "https://placehold.co/288x180?text=Event";
const userStore = useUserStore();

onMounted(async () => {
  try {
    const token = userStore.accessToken || localStorage.getItem("accessToken");
    const res = await fetch(import.meta.env.VITE_API_BASE_URL + "/events", {
      headers: token
        ? {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        : { "Content-Type": "application/json" }
    });
    if (!res.ok) {
      throw new Error(`Request failed with status code：${res.status}`);
    }
    const json = await res.json();
    events.value = json.data.events;
  } catch (err) {
    console.error("Error getting list of events：", err);
    error.value = err.message || "make a mistake";
  } finally {
    loading.value = false;
  }
});

const filteredEvents = computed(() => {
  return events.value.filter((event) => {
    let match = true;
    if (searchText.value.trim() !== "") {
      match =
        match &&
        event.name
          .toLowerCase()
          .includes(searchText.value.trim().toLowerCase());
    }
    if (filterCriteria.value.selectedActivity) {
      match = match && event.eventType === filterCriteria.value.selectedActivity;
    }
    return match;
  });
});

const sortedEvents = computed(() => {
  return [...filteredEvents.value].sort((a, b) => {
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
    minPrice: criteria.minPrice || 0,
    maxPrice: criteria.maxPrice || Infinity
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
</script>

<style scoped>
.bg-custom {
  background-color: #edece8;
}
.font-custom {
  font-family: "Font";
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
  background-color: #fff; /* Light background for card */
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
  color: #333; /* Dark text for light background */
}

.event-grid-date-time {
  font-size: 0.85rem;
  color: #555; /* Slightly lighter dark text */
}
</style>
