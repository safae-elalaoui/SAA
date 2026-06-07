import axios from 'axios';

// Base backend API URL
const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically append token if stored in local storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('estate_elite_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: automatically redirect to login or clear session on 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid credentials
      localStorage.removeItem('estate_elite_token');
      localStorage.removeItem('estate_elite_user');
      
      // Let the application context or router handle redirection if needed
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
