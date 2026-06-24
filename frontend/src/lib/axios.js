import axios from "axios";

const API_URL = "http://localhost:5000/api"; // ✅ 5000 karein (5001 nahi)

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized - but not redirecting immediately");
    
    }
    return Promise.reject(error);
  }
);

export default api;