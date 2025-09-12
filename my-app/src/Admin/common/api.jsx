import axios from "axios";

export const apiurl = "http://127.0.0.1:8000/api/";

// Create Axios instance
const api = axios.create({
  baseURL: apiurl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically (if exists)
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem("userInfo");
  if (userInfo) {
    try {
      const token = JSON.parse(userInfo)?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore JSON parse errors
    }
  }
  return config;
});

export default api;
