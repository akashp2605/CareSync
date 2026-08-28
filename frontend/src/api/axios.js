import axios from 'axios';

// Get base URL from environment variables, fallback to localhost:8080
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // 10 seconds timeout
});

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      // Server responded with a status other than 2xx
      const status = error.response.status;
      const data = error.response.data;

      if (status === 400) {
        errorMessage = data.message || 'Invalid request parameters.';
      } else if (status === 404) {
        errorMessage = 'Requested resource not found on server.';
      } else if (status === 500) {
        errorMessage = 'Internal server error. Please contact admin.';
      } else {
        errorMessage = data.message || `Server error: ${status}`;
      }
    } else if (error.request) {
      // Request made but no response received (Network error)
      errorMessage = 'Network error. Cannot reach the server. Please check if the backend is running.';
    } else {
      // Something happened in setting up the request
      errorMessage = error.message;
    }

    // Attach custom message to the error object so components can display it
    error.customMessage = errorMessage;
    return Promise.reject(error);
  }
);

export default api;
