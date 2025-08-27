// src/api/facultyApi.js
import axios from 'axios';

const facultyAPI = axios.create({
  baseURL: 'http://localhost:5001/api/faculty'
});

facultyAPI.interceptors.request.use(config => {
  const token = localStorage.getItem('facultyToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default facultyAPI;