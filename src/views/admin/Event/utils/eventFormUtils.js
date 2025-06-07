// Helper function: extract date from ISO time string, format is YYYY-MM-DD
export const parseDate = (dateTimeString) => {
  if (!dateTimeString) return "";
  const dateObj = new Date(dateTimeString);
  if (isNaN(dateObj)) return "";
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const day = dateObj.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Auxiliary function: extracts the time from the ISO time string in the format HH:MM (24-hour format)
export const parseTime = (dateTimeString) => {
  if (!dateTimeString) return "";
  const dateObj = new Date(dateTimeString);
  if (isNaN(dateObj)) return "";
  const hours = dateObj.getHours().toString().padStart(2, "0");
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Helper function to combine date and time strings into ISO 8601 format
export const combineDateAndTime = (dateString, timeString) => {
  if (
    !dateString ||
    typeof dateString !== "string" ||
    !dateString.match(/^\d{4}-\d{2}-\d{2}$/)
  ) {
    console.error(
      "Invalid or empty dateString provided to combineDateAndTime:",
      dateString
    );
    return null;
  }

  let timePart = "00:00:00";
  if (timeString && typeof timeString === "string") {
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      timePart = `${timeString}:00`;
    } else if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
      timePart = timeString;
    }
  }

  const isoString = `${dateString}T${timePart}.000Z`;

  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    console.error("Invalid date or time for ISO conversion:", isoString);
    return null;
  }
  return date.toISOString();
};

// Default form state
export const getDefaultFormState = () => ({
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  location: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  organizer: "",
  capacity: 100,
  imageUrl: "",
  eventType: "",
  isFree: false,
});

// Default ticket type
export const getDefaultTicketType = () => ({
  id: Date.now(),
  name: "",
  price: 0.0,
  quantity: 1,
  description: "",
  salesStart: "",
  salesEnd: "",
});

// Default question
export const getDefaultQuestion = () => ({
  id: `new_${Date.now()}`,
  text: "",
  type: "text",
  required: false,
  options: ["Option 1"],
  hasMaxLength: false,
  maxLength: 255,
  order: 0,
});

// Event types options
export const EVENT_TYPES = [
  { value: "SPORTS", label: "Sports" },
  { value: "MUSICAL", label: "Musical" },
  { value: "SOCIAL", label: "Social" },
  { value: "VOLUNTEERING", label: "Volunteering" },
  { value: "CONFERENCE", label: "Conference" },
];

// Question types options
export const QUESTION_TYPES = [
  { value: "text", label: "Text Input" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkboxes (multiple selection)" },
];
