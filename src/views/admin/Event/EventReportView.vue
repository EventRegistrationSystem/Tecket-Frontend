<template>
  <div class="event-report-view p-4">
    <!-- Back button -->
    <button @click="router.back()" class="text-blue-600 hover:text-blue-800 mb-4 flex items-center">
      <i class="pi pi-arrow-left mr-2"></i>
      Back to Event Details
    </button>

    <h1 class="text-2xl font-bold mb-6">Event Report</h1>

    <div v-if="loading" class="text-center">
      <p>Loading report...</p>
      <!-- You can add a spinner or loading animation here -->
    </div>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
      role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error.message || 'Failed to load event report.' }}</span>
    </div>

    <div v-if="reportData && !loading && !error">
      <!-- Event Information -->
      <section class="mb-8 p-4 border rounded shadow-sm">
        <h2 class="text-xl font-semibold mb-3">{{ reportData.eventName }}</h2>
        <p class="text-gray-700 mb-2"><strong>Description:</strong> {{ reportData.eventDescription }}</p>
        <p class="text-gray-700">
          <strong>Date:</strong>
          {{ formatDate(reportData.start) }} at {{ formatTime(reportData.start) }} -
          {{ formatDate(reportData.end) }} at {{ formatTime(reportData.end) }}
        </p>
      </section>

      <!-- Sales Section -->
      <section class="mb-8 p-4 border rounded shadow-sm">
        <h2 class="text-xl font-semibold mb-3">Sales Summary</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="p-3 bg-blue-50 rounded">
            <p class="text-lg"><strong>Total Tickets Sold:</strong> {{ reportData.sales.totalTickets }}</p>
          </div>
          <div class="p-3 bg-green-50 rounded">
            <p class="text-lg"><strong>Total Revenue:</strong> ${{ reportData.sales.revenue.toFixed(2) }}</p>
          </div>
        </div>
        <div class="mb-4">
          <h3 class="text-lg font-medium mb-2">Tickets Sold by Type:</h3>
          <ul class="list-disc pl-5">
            <li v-for="ticket in reportData.sales.soldByTickets" :key="ticket.name">
              {{ ticket.name }}: {{ ticket.total }}
            </li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg font-medium mb-2">Revenue by Ticket Type:</h3>
          <ul class="list-disc pl-5">
            <li v-for="ticket in reportData.sales.revenueByTickets" :key="ticket.name">
              {{ ticket.name }}: ${{ ticket.total.toFixed(2) }}
            </li>
          </ul>
        </div>
      </section>

      <!-- Remaining Tickets Section -->
      <section class="mb-8 p-4 border rounded shadow-sm">
        <h2 class="text-xl font-semibold mb-3">Remaining Tickets</h2>
        <p class="text-lg mb-2"><strong>Total Remaining Tickets:</strong> {{ reportData.remaining.remainingTickets }}
        </p>
        <h3 class="text-lg font-medium mb-2">Remaining by Ticket Type:</h3>
        <ul class="list-disc pl-5">
          <li v-for="ticket in reportData.remaining.remainingByTicket" :key="ticket.name">
            {{ ticket.name }}: {{ ticket.total }}
          </li>
        </ul>
      </section>

      <!-- Participants Section -->
      <section class="mb-8 p-4 border rounded shadow-sm">
        <h2 class="text-xl font-semibold mb-3">Participants ({{ reportData.participants.length }})</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white">
            <thead class="bg-gray-100">
              <tr>
                <th class="py-2 px-4 border-b text-left"></th> <!-- For expand/collapse icon -->
                <th class="py-2 px-4 border-b text-left">Name</th>
                <th class="py-2 px-4 border-b text-left">Email</th>
                <th class="py-2 px-4 border-b text-left">Ticket Type</th>
                <th class="py-2 px-4 border-b text-left">Registration Status</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(participant, index) in reportData.participants" :key="participant.email">
                <tr class="hover:bg-gray-50 cursor-pointer" @click="toggleExpand(participant.email)">
                  <td class="py-2 px-4 border-b text-center">
                    <span :class="isExpanded(participant.email) ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></span>
                  </td>
                  <td class="py-2 px-4 border-b">{{ participant.name }}</td>
                  <td class="py-2 px-4 border-b">{{ participant.email }}</td>
                  <td class="py-2 px-4 border-b">{{ participant.ticket }}</td>
                  <td class="py-2 px-4 border-b">{{ participant.registrationStatus }}</td>
                </tr>
                <tr v-if="isExpanded(participant.email)">
                  <td colspan="5" class="p-4 bg-gray-50 border-b">
                    <h4 class="font-semibold mb-2">Questionnaire Responses:</h4>
                    <ul v-if="participant.questionnaireResponses.length" class="list-disc pl-5">
                      <li v-for="(qr, qrIndex) in participant.questionnaireResponses" :key="qrIndex" class="mb-1">
                        <strong class="text-gray-700">{{ qr.question }}:</strong> {{
                        formatQuestionnaireResponse(qr.response) }}
                      </li>
                    </ul>
                    <p v-else class="text-gray-500">No responses for this participant.</p>
                  </td>
                </tr>
              </template>
              <tr v-if="!reportData.participants.length">
                <td colspan="5" class="py-2 px-4 border-b text-center text-gray-500">No participants found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Aggregated Questions Section -->
      <section class="p-4 border rounded shadow-sm">
        <h2 class="text-xl font-semibold mb-3">Aggregated Question Responses</h2>
        <div v-if="Object.keys(reportData.questions).length">
          <div v-for="(responses, question) in reportData.questions" :key="question"
            class="mb-4 p-3 bg-gray-50 rounded">
            <h3 class="text-lg font-medium mb-1">{{ question }}</h3>
            <ul class="list-disc pl-5">
              <li v-for="(count, option) in responses" :key="option">
                {{ option }}: {{ count }}
              </li>
            </ul>
          </div>
        </div>
        <p v-else class="text-gray-500">No aggregated question responses available.</p>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Added useRouter
import { getEventReport } from '../../../api/eventServices'; // Adjusted path

const route = useRoute();
const router = useRouter(); // Instantiate useRouter
const reportData = ref(null);
const loading = ref(true);
const error = ref(null);
const expandedParticipants = ref([]); // Stores emails of expanded participants

const eventId = computed(() => route.params.eventId);

const fetchReportData = async () => {
  if (!eventId.value) {
    error.value = { message: 'Event ID is missing.' };
    loading.value = false;
    return;
  }
  try {
    loading.value = true;
    error.value = null;
    const response = await getEventReport(eventId.value);
    reportData.value = response;
  } catch (err) {
    console.error('Failed to fetch event report:', err);
    error.value = err.response?.data || err; // Use error structure from API service
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

const formatQuestionnaireResponse = (response) => {
  if (typeof response !== 'string') return response; // Should be a string
  try {
    // Check if it's a JSON array string (for CHECKBOX type)
    if (response.startsWith('[') && response.endsWith(']')) {
      const parsedArray = JSON.parse(response);
      return Array.isArray(parsedArray) ? parsedArray.join(', ') : response;
    }
  } catch (e) {
    // Not a valid JSON string, return as is
    return response;
  }
  return response;
};

const toggleExpand = (participantEmail) => {
  const index = expandedParticipants.value.indexOf(participantEmail);
  if (index > -1) {
    expandedParticipants.value.splice(index, 1); // Collapse
  } else {
    expandedParticipants.value.push(participantEmail); // Expand
  }
};

const isExpanded = (participantEmail) => {
  return expandedParticipants.value.includes(participantEmail);
};

onMounted(() => {
  fetchReportData();
});
</script>

<style scoped>
/* Add any component-specific styles here if needed */
.event-report-view {
  max-width: 1000px;
  margin: auto;
}
</style>
