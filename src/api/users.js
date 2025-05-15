// ==========================
// User-related API methods
// ==========================
import { useUserStore } from "@/store/user";

/**
 * Fetch user profile data using TOKEN
 * @returns {Promise<Object>} User Profile object
 */
export const fetchUserProfile = async () => {
  try {
    const userStore = useUserStore();
    const token = userStore.accessToken || localStorage.getItem("accessToken");
    const response = await fetch(
      import.meta.env.VITE_API_BASE_URL + `/user/profile`,
      {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          : { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/**
 * Fetch all users data
 * @returns {Promise<Array>} Array of users
 */
export const fetchAllUsersData = async () => {
  const url = import.meta.env.VITE_API_BASE_URL + "/user/users";
  const token = localStorage.getItem("accessToken");
  var usersData = null;
  await fetch(url, {
    method: "GET",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : { "Content-Type": "application/json" },
  })
    .then((response) => {
      return response.json();
    })
    .then((responseData) => {
      usersData = responseData.data;
    })
    .catch((error) => {
      console.error("Error fetching user profile:", error);
      throw error;
    });

  return usersData;
};

/**
 * Delete a user
 * @param {Number} userId
 * @returns {Promise<String>} Message
 */
export const deleteUserbyID = async (userId) => {
  const url = import.meta.env.VITE_API_BASE_URL + `/user/${userId}`;
  const token = localStorage.getItem("accessToken");
  var message = null;
  await fetch(url, {
    method: "DELETE",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : { "Content-Type": "application/json" },
  })
    .then((response) => {
      return response.json();
    })
    .then((responseData) => {
      message = responseData.data;
    })
    .catch((error) => {
      console.error("Error delete user profile:", error);
      throw error;
    });

  return message;
};

/**
 * Create a user
 * @param {Object} userData
 * @returns {Promise<String>} Message
 */
export const createUser = async (userData) => {
  const url = import.meta.env.VITE_API_BASE_URL + `/user`;
  // console.log('userData', userData)
  const token = localStorage.getItem("accessToken");
  var message = null;
  await fetch(url, {
    method: "POST",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  })
    .then((response) => {
      return response.json();
    })
    .then((responseData) => {
      message = responseData.data;
    })
    .catch((error) => {
      console.error("Error create user profile:", error);
      throw error;
    });

  return "Successful";
};

/**
 * Get user by Id
 * @param {Number} userId
 * @returns {Promise<Object>} userData
 */
export const getUserById = async (userId) => {
  const url = import.meta.env.VITE_API_BASE_URL + `/user/${userId}`;
  const token = localStorage.getItem("accessToken");
  var userData = null;
  await fetch(url, {
    method: "GET",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : { "Content-Type": "application/json" },
  })
    .then((response) => {
      return response.json();
    })
    .then((responseData) => {
      userData = responseData.data;
    })
    .catch((error) => {
      console.error("Error get user profile:", error);
      throw error;
    });

  return userData;
};

/**
 * Update a user
 * @param {Number} userId
 * @param {Object} userData
 * @returns {Promise<String>} Message
 */
export const updateUser = async (userId,userData) => {
  const url = import.meta.env.VITE_API_BASE_URL + `/user/${userId}`;
  const token = localStorage.getItem("accessToken");
  var message = null;
  await fetch(url, {
    method: "PUT",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  })
    .then((response) => {
      return response.json();
    })
    .then((responseData) => {
      message = responseData.data;
    })
    .catch((error) => {
      console.error("Error update user profile:", error);
      throw error;
    });
    
  return "Successful";
};