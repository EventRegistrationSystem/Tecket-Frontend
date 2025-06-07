import { defineStore } from 'pinia'

export const useRegistrationStore = defineStore('registration', {
  state: () => ({
    eventId: null,
    eventDetails: null, // To store event name, tickets, questions, etc.
    selectedTickets: [], // Array of { ticketId, name, price, quantity }
    participants: [], // Array of participant objects { email, firstName, lastName, ..., responses: [] }
    registrationId: null, // From backend after successful registration submission
    paymentToken: null, // For guest flow on paid events
    currentStep: 0, // 0: Ticket Selection, 1: Personal Info, 2: Questionnaire, 3: Review
    // Add other necessary states like error messages, loading states if needed
  }),
  getters: {
    totalSelectedTickets: (state) => {
      return state.selectedTickets.reduce((total, ticket) => total + ticket.quantity, 0)
    },
    isEventLoaded: (state) => !!state.eventDetails,
    getParticipantCount: (state) => state.participants.length,
  },
  actions: {
    setEvent(eventData) {
      console.log('[Store setEvent] Received eventData:', JSON.parse(JSON.stringify(eventData)));
      if (eventData && eventData.eventQuestions) {
        console.log('[Store setEvent] eventData.eventQuestions:', JSON.parse(JSON.stringify(eventData.eventQuestions)));
      } else {
        console.log('[Store setEvent] No eventQuestions in received eventData.');
      }
      this.eventDetails = eventData
      this.eventId = eventData.id
      // Potentially pre-populate selectedTickets if eventData.tickets exists
      // and you want to initialize quantities to 0 or some default.
      // For now, we'll assume ticket selection happens explicitly.
      this.selectedTickets = eventData.tickets ? eventData.tickets.map(t => ({
        ticketId: t.id,
        name: t.name,
        price: t.price,
        quantity: 0, // Initialize quantity to 0
        salesStart: t.salesStart,
        salesEnd: t.salesEnd,
        status: t.status,
        quantityTotal: t.quantityTotal,
        quantitySold: t.quantitySold
      })) : [];
      this.initializeParticipants(); // Ensure participants are initialized/updated when event changes
    },
    updateTicketQuantity(ticketId, quantity) {
      const ticket = this.selectedTickets.find((t) => t.ticketId === ticketId)
      if (ticket) {
        ticket.quantity = Math.max(0, quantity) // Ensure quantity is not negative
      }
      this.initializeParticipants() // Re-initialize participants when ticket quantities change
    },
    // Initializes or adjusts the participants array based on total selected tickets
    initializeParticipants() {
      console.log('[Store initializeParticipants] Starting.');
      let targetParticipantCount = this.totalSelectedTickets;
      // For free events, ensure at least one participant if no tickets were "selected"
      if (this.eventDetails && this.eventDetails.isFree && targetParticipantCount === 0) {
        targetParticipantCount = 1;
        console.log('[Store initializeParticipants] Free event, ensuring 1 participant.');
      }

      const currentParticipantsArray = [...this.participants]; // Work with a copy
      const currentParticipantCount = currentParticipantsArray.length;
      console.log(`[Store initializeParticipants] Target: ${targetParticipantCount}, Current: ${currentParticipantCount}`);


      if (targetParticipantCount > currentParticipantCount) {
        for (let i = 0; i < targetParticipantCount - currentParticipantCount; i++) {
          currentParticipantsArray.push({
            email: '', firstName: '', lastName: '',
            phoneNumber: '', dateOfBirth: '', address: '',
            city: '', state: '', zipCode: '', country: '',
            responses: [] // Initialize responses array
          });
        }
      } else if (targetParticipantCount < currentParticipantCount) {
        currentParticipantsArray.splice(targetParticipantCount);
      }

      // Now, ensure each participant has the correct response structure based on eventQuestions
      if (this.eventDetails && this.eventDetails.eventQuestions && this.eventDetails.eventQuestions.length > 0) {
        console.log('[Store initializeParticipants] Processing eventQuestions:', JSON.parse(JSON.stringify(this.eventDetails.eventQuestions)));
        currentParticipantsArray.forEach((p, pIndex) => {
          const existingResponsesMap = new Map(p.responses.map(r => [r.eventQuestionId, r.responseText]));
          p.responses = this.eventDetails.eventQuestions.map(q => ({
            eventQuestionId: q.id, // This is EventQuestion.id (unique link ID)
            questionId: q.question.id, // This is the actual Question.id from global questions table
            questionText: q.question.questionText,
            isRequired: q.isRequired,
            questionType: q.question.questionType, // e.g., TEXT, MULTIPLE_CHOICE
            validationRules: q.question.validationRules, // e.g., { options: ["A", "B"] } for MCQ
            responseText: existingResponsesMap.get(q.id) || '' // Preserve existing response if any
          }));
          console.log(`[Store initializeParticipants] Participant ${pIndex} responses mapped:`, JSON.parse(JSON.stringify(p.responses)));
        });
      } else {
        console.log('[Store initializeParticipants] No eventQuestions found or empty. Ensuring empty responses for participants.');
        // No event questions, ensure responses array is empty for all participants
        currentParticipantsArray.forEach(p => {
          p.responses = [];
        });
      }
      this.participants = currentParticipantsArray; // Assign the modified array back to the state
      console.log('[Store initializeParticipants] Final participants state:', JSON.parse(JSON.stringify(this.participants)));
    },
    updateParticipantInfo(index, participantData) {
      if (this.participants[index]) {
        this.participants[index] = { ...this.participants[index], ...participantData }
      }
    },
    updateParticipantResponse(participantIndex, questionEventQuestionId, responseText) {
      if (this.participants[participantIndex] && this.participants[participantIndex].responses) {
        const response = this.participants[participantIndex].responses.find(
          (r) => r.eventQuestionId === questionEventQuestionId
        )
        if (response) {
          response.responseText = responseText
        }
      }
    },
    setRegistrationResult(registrationId, paymentToken = null) {
      this.registrationId = registrationId
      this.paymentToken = paymentToken
    },
    setCurrentStep(step) {
      this.currentStep = step
    },
    resetRegistrationState() {
      this.eventId = null
      this.eventDetails = null
      this.selectedTickets = []
      this.participants = []
      this.registrationId = null
      this.paymentToken = null
      this.currentStep = 0
    },
    // Action to prepare data for submission
    getRegistrationPayload() {
      if (!this.eventId) {
        console.error("Event ID is missing in registration store.")
        return null;
      }

      // Filter out tickets with quantity 0
      const ticketsForPayload = this.selectedTickets
        .filter(ticket => ticket.quantity > 0)
        .map(ticket => ({
          ticketId: ticket.ticketId,
          quantity: ticket.quantity
        }));

      // Assign ticketId to each participant based on ticket selection
      const participantsWithTickets = this.assignTicketsToParticipants();

      return {
        eventId: this.eventId,
        tickets: (this.eventDetails && this.eventDetails.isFree) ? [] : ticketsForPayload,
        participants: participantsWithTickets.map(p => ({
          email: p.email,
          firstName: p.firstName,
          lastName: p.lastName,
          phoneNumber: p.phoneNumber || undefined,
          dateOfBirth: p.dateOfBirth || undefined,
          address: p.address || undefined,
          city: p.city || undefined,
          state: p.state || undefined,
          zipCode: p.zipCode || undefined,
          country: p.country || undefined,
          ticketId: p.ticketId, // Include the assigned ticketId
          responses: p.responses
            .filter(r => r.responseText !== '' || r.isRequired)
            .map(r => ({
              eventQuestionId: r.eventQuestionId,
              responseText: r.responseText
            }))
        }))
      }
    },

    // Helper method to assign tickets to participants
    assignTicketsToParticipants() {
      const participantsWithTickets = [...this.participants];
      let participantIndex = 0;

      // For free events, assign the first available ticket (or null if no tickets)
      if (this.eventDetails && this.eventDetails.isFree) {
        const firstTicket = this.selectedTickets.length > 0 ? this.selectedTickets[0] : null;
        participantsWithTickets.forEach(participant => {
          participant.ticketId = firstTicket ? firstTicket.ticketId : null;
        });
        return participantsWithTickets;
      }

      // For paid events, assign tickets based on quantities
      this.selectedTickets.forEach(ticket => {
        for (let i = 0; i < ticket.quantity; i++) {
          if (participantIndex < participantsWithTickets.length) {
            participantsWithTickets[participantIndex].ticketId = ticket.ticketId;
            participantIndex++;
          }
        }
      });

      return participantsWithTickets;
    }
  }
})
