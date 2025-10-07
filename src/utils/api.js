import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-wheat-delta.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
