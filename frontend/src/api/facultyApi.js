import axios from 'axios';
import getApiBase from '../admin-client/src/utils/getApiBase';

const facultyAPI = axios.create({
  baseURL: `${getApiBase()}/api/faculty`,
  withCredentials: true
});

facultyAPI.interceptors.request.use(config => {
  const token = localStorage.getItem('facultyToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default facultyAPI;