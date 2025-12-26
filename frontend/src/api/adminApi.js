import axios from 'axios';
import getApiBase from '../utils/getApiBase';

const API = axios.create({
  // Add /api/admin to the end of your base URL
  baseURL: `${getApiBase()}/api/admin`, 
});

// 🔒 Request Interceptor: Attach the token to every outgoing request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 🔄 Response Interceptor: Handle Global Errors (like session expiration)
API.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (error.response) {
      // 401: Unauthorized / Session Expired
      if (error.response.status === 401) {
        console.warn('Session expired. Redirecting to login...');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login'; // Force redirect to login
      }
      
      // 403: Forbidden (Role Mismatch)
      if (error.response.status === 403) {
        alert("Access Denied: You don't have permission for this action.");
      }
    }
    return Promise.reject(error);
  }
);

export default API;