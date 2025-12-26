import axios from 'axios';
import getApiBase from '../utils/getApiBase'; // Fixed relative path

const facultyAPI = axios.create({
  // Matches the mount point in our backend index.js
  baseURL: `${getApiBase()}/api/faculty`,
});

// 🔒 Request Interceptor: Attach Faculty JWT
facultyAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('facultyToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 🔄 Response Interceptor: Handle Judge-specific session issues
facultyAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 401: Judge session expired
      if (error.response.status === 401) {
        console.warn('Judge session expired. Redirecting to faculty login...');
        localStorage.removeItem('facultyToken');
        localStorage.removeItem('facultyUser');
        
        // Redirect to the faculty-specific login page
        window.location.href = '/faculty/login'; 
      }
      
      // 403: Not assigned to this event
      if (error.response.status === 403) {
        alert("Permission Denied: You are not assigned as a judge for this event.");
      }
    }
    return Promise.reject(error);
  }
);

export default facultyAPI;