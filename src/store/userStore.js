import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    
    // If role is critical before full user object is fetched, keep separate role state.
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    // Getter for user role if needed frequently
    userRole: (state) => state.user?.role || null,
    // Getter for full user data
    currentUser: (state) => state.user,
  },

  actions: {
    setAuthData(userData, token) {
      this.user = userData;
      this.accessToken = token;
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', token);
    },
    setAccessToken(token) {
      this.accessToken = token;
      localStorage.setItem('accessToken', token);
    },
    // setUser might be useful if user data is updated separately from login/token
    setUser(userData) {
      this.user = userData;
      localStorage.setItem('user', JSON.stringify(userData));
    },

    
    clearUserSession() {
      this.accessToken = null;
      this.user = null;
     
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    
      console.log('User session cleared');
    }
  },
});
