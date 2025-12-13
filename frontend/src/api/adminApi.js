import axios from 'axios';
import getApiBase from '../utils/getApiBase';

const API = axios.create({
  baseURL: getApiBase(),
  withCredentials: true
});



API.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;