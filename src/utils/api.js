import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-2rol.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
