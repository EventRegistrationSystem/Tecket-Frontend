// Helper function: extract date from ISO time string, format is YYYY-MM-DD
export const parseDate = (dateTimeString) => {
  if (!dateTimeString) return "";
  // Handles both ISO strings from the backend and YYYY-MM-DD from the input
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
  const hours = dateObj.getUTCHours().toString().padStart(2, "0");
  const minutes = dateObj.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Helper function to combine date and time strings into a valid ISO 8601 string
export const combineDateAndTime = (dateString, timeString) => {
  if (!dateString) return null; // dateString is expected to be in YYYY-MM-DD format

  const timePart = timeString || '00:00:00';

  // Create a new Date object from the local date and time parts.
  // This correctly interprets the input as local time.
  const [year, month, day] = dateString.split('-').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);

  // Month is 0-indexed in JavaScript's Date constructor
  const localDate = new Date(year, month - 1, day, hours, minutes, seconds);

  if (isNaN(localDate.getTime())) {
    return null;
  }

  // .toISOString() converts the local date to a UTC-based ISO string,
  // which is the standard format for APIs and databases.
  return localDate.toISOString();
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
