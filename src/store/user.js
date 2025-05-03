import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    role : null,
  }),

  getters: {
    isAuthenticated: () => {
      if (localStorage.getItem('accessToken') == null) {
        return false;
      } else {
        return true;
      }
    },
  },

  actions: {
    setAccessToken(token) {
      this.accessToken = token;
      localStorage.setItem('accessToken',token);
    },
    setRole(role) {
      this.role = role;
      localStorage.setItem('role',role);

    },
    clearAccessToken() {
      this.accessToken = null;
      localStorage.removeItem('accessToken');
    },
    clearRole() {
      this.role = null;
      localStorage.removeItem('role');
    }
  },

});
