// store/student.store.js
import { create } from "zustand";
import axios from "axios";

const studentAxios = axios.create({
  withCredentials: true,
  timeout: 10000,
});

const STUDENT_API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api/student"
    : "/api/student";

export const useStudentAuthStore = create((set, get) => ({
  student: null,
  isAuthenticated: false,
  isLoading: true, // Start with true to indicate initial auth check
  error: null,
  message: null,

  // Login function
  login: async (username, password) => {
    set({ isLoading: true, error: null, message: null });
    
    try {
      const response = await studentAxios.post(`${STUDENT_API_URL}/login`, {
        username,
        password
      });

      if (response.data.success) {
        set({
          student: response.data.student,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          message: "Login successful"
        });
        return { success: true };
      } else {
        set({
          error: response.data.message || "Login failed",
          isLoading: false
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Login failed. Please try again.";
      
      set({
        error: errorMessage,
        isLoading: false
      });
      return { success: false, error: errorMessage };
    }
  },

  // Logout function
  logout: async () => {
    set({ isLoading: true, error: null, message: null });
    
    try {
      const response = await studentAxios.post(`${STUDENT_API_URL}/logout`);
      
      if (response.data.success) {
        set({
          student: null,
          isAuthenticated: false,
          isLoading: false,
          message: "Logout successful"
        });
        return { success: true };
      } else {
        set({
          error: response.data.message || "Logout failed",
          isLoading: false
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Logout failed";
      
      // Even if logout fails on server, reset client state
      set({
        student: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Check authentication status
  checkAuth: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await studentAxios.get(`${STUDENT_API_URL}/check-auth`);
      
      if (response.data.success && response.data.isAuthenticated) {
        set({
          student: response.data.student,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return { isAuthenticated: true, student: response.data.student };
      } else {
        set({
          student: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        return { isAuthenticated: false };
      }
    } catch (error) {
      set({
        student: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      return { isAuthenticated: false };
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true, error: null, message: null });
    
    try {
      const response = await studentAxios.post(`${STUDENT_API_URL}/change-password`, {
        currentPassword,
        newPassword
      });

      if (response.data.success) {
        set({
          isLoading: false,
          message: "Password changed successfully",
          error: null
        });
        return { success: true };
      } else {
        set({
          error: response.data.message || "Password change failed",
          isLoading: false
        });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Password change failed";
      
      set({
        error: errorMessage,
        isLoading: false
      });
      return { success: false, error: errorMessage };
    }
  },

  // Clear error messages
  clearError: () => set({ error: null }),

  // Clear messages
  clearMessage: () => set({ message: null }),

  // Reset entire state
  reset: () => set({
    student: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    message: null
  })
}));