import axios from 'axios';
// import checkout from './checkout';
const API_URL = 'https://backend-testing-5o8c.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information for debugging
    console.error('API response error:', {
      message: error.message,
      response: error.response,
      config: error.config,
    });

    // Handle 401 errors (unauthorized)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
// how to import this file in another file
// import api from './api';
//import api from '../../api/api';
