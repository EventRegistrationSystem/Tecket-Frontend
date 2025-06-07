// Form validation utilities
export const validateEventForm = (eventForm, ticketTypes, questions) => {
  const errors = {};

  // Basic form validation
  if (!eventForm.name) errors.name = "Event name is required";
  if (!eventForm.startDate) errors.startDate = "Event start date is required";
  if (!eventForm.endDate) errors.endDate = "Event end date is required";

  if (
    eventForm.startDate &&
    eventForm.endDate &&
    new Date(eventForm.endDate) < new Date(eventForm.startDate)
  ) {
    errors.endDate = "End date must be after start date";
  }

  if (!eventForm.location) errors.location = "Location is required";
  if (!eventForm.capacity || eventForm.capacity <= 0)
    errors.capacity = "Valid capacity is required";
  if (!eventForm.eventType) errors.eventType = "Event type is required";

  // Ticket validation for paid events
  if (eventForm.isFree === false && ticketTypes.length === 0) {
    errors.tickets = "At least one ticket type is required for paid events.";
  }

  if (eventForm.isFree === false) {
    ticketTypes.forEach((ticket, index) => {
      if (!ticket.name)
        errors[`ticket_${index}_name`] = `Ticket ${index + 1} name is required.`;
      if (ticket.price === undefined || ticket.price < 0)
        errors[`ticket_${index}_price`] = `Ticket ${index + 1} price is invalid.`;
      if (ticket.quantity === undefined || ticket.quantity <= 0)
        errors[`ticket_${index}_quantity`] = `Ticket ${index + 1} quantity is invalid.`;

      if (!ticket.salesStart) {
        errors[`ticket_${index}_salesStart`] = `Ticket ${index + 1} sales start date is required.`;
      } else if (!ticket.salesStart.match(/^\d{4}-\d{2}-\d{2}$/)) {
        errors[`ticket_${index}_salesStart`] = `Ticket ${index + 1} sales start date must be a valid date (YYYY-MM-DD).`;
      }

      if (!ticket.salesEnd) {
        errors[`ticket_${index}_salesEnd`] = `Ticket ${index + 1} sales end date is required.`;
      } else if (!ticket.salesEnd.match(/^\d{4}-\d{2}-\d{2}$/)) {
        errors[`ticket_${index}_salesEnd`] = `Ticket ${index + 1} sales end date must be a valid date (YYYY-MM-DD).`;
      }

      if (
        ticket.salesStart &&
        ticket.salesEnd &&
        ticket.salesStart.match(/^\d{4}-\d{2}-\d{2}$/) &&
        ticket.salesEnd.match(/^\d{4}-\d{2}-\d{2}$/) &&
        new Date(ticket.salesEnd) < new Date(ticket.salesStart)
      ) {
        errors[`ticket_${index}_salesEnd`] = `Ticket ${index + 1} sales end date must be after sales start date.`;
      }
    });
  }

  // Question validation
  if (questions.length > 0) {
    questions.forEach((q, index) => {
      if (!q.text.trim())
        errors[`question_${index}_text`] = `Question ${index + 1} text is required.`;

      if (
        (q.type === "select" || q.type === "checkbox") &&
        (!q.options ||
          q.options.length === 0 ||
          q.options.some((opt) => !opt.trim()))
      ) {
        errors[`question_${index}_options`] = `Question ${index + 1} (${q.type === "select" ? "Dropdown" : "Checkboxes"
          }) must have at least one non-empty option.`;
      }
    });
  }

  let firstErrorTab = null;
  if (Object.keys(errors).length > 0) {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey.startsWith('ticket_')) {
      firstErrorTab = 'tickets';
    } else if (firstErrorKey.startsWith('question_')) {
      firstErrorTab = 'questionnaire';
    } else {
      firstErrorTab = 'basic';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstErrorTab,
  };
};

// Scroll to first error
export const scrollToFirstError = (errors) => {
  const firstErrorKey = Object.keys(errors)[0];
  if (firstErrorKey) {
    const errorElement =
      document.querySelector(`[name="${firstErrorKey}"]`) ||
      document.querySelector(`.${firstErrorKey}`) ||
      document.querySelector(`#${firstErrorKey}`);
    if (errorElement && typeof errorElement.scrollIntoView === "function") {
      errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      const mainForm = document.querySelector("form");
      mainForm?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
};
