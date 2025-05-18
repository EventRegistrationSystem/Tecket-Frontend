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
      })) : []
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
      const totalTickets = this.totalSelectedTickets
      const currentParticipants = this.participants.length

      if (totalTickets > currentParticipants) {
        // Add new participant stubs
        for (let i = 0; i < totalTickets - currentParticipants; i++) {
          this.participants.push({
            email: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            dateOfBirth: '', // Consider date format
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            responses: [], // { eventQuestionId, responseText }
          })
        }
      } else if (totalTickets < currentParticipants) {
        // Remove excess participants from the end
        this.participants.splice(totalTickets)
      }
      // Ensure each participant has a responses array for each event question
      if (this.eventDetails && this.eventDetails.eventQuestions) {
        this.participants.forEach(p => {
          p.responses = this.eventDetails.eventQuestions.map(q => ({
            eventQuestionId: q.id, // This is EventQuestion.id
            questionId: q.question.id, // This is Question.id
            questionText: q.question.questionText,
            isRequired: q.isRequired,
            responseText: ''
          }));
        });
      }
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

      // For free events, the backend expects an empty tickets array
      if (this.eventDetails && this.eventDetails.isFree && ticketsForPayload.length === 0) {
        // If it's a free event and no tickets were "selected" (because they are free and implicit)
        // we might need to adjust this based on backend expectations for free event registrations.
        // The backend guide says: "tickets: Array<{ ticketId: number, quantity: number }> (Empty array [] for free events)"
        // This implies that even for free events, if there's a concept of "1 registration",
        // the participant data is key, and tickets array should be empty.
        // If the free event still has "ticket types" that are free, and user selects one,
        // then ticketsForPayload would not be empty. This needs clarification or testing.
        // For now, if it's free and no tickets were explicitly selected (e.g. quantity > 0), send empty.
      }


      return {
        eventId: this.eventId,
        tickets: (this.eventDetails && this.eventDetails.isFree) ? [] : ticketsForPayload,
        participants: this.participants.map(p => ({
          email: p.email,
          firstName: p.firstName,
          lastName: p.lastName,
          phoneNumber: p.phoneNumber || undefined, // Send undefined if empty to avoid empty strings if backend expects null/omitted
          dateOfBirth: p.dateOfBirth || undefined,
          address: p.address || undefined,
          city: p.city || undefined,
          state: p.state || undefined,
          zipCode: p.zipCode || undefined,
          country: p.country || undefined,
          responses: p.responses
            .filter(r => r.responseText !== '' || r.isRequired) // Send responses that are answered or required
            .map(r => ({
              eventQuestionId: r.eventQuestionId,
              responseText: r.responseText
            }))
        }))
      }
    }
  }
})
