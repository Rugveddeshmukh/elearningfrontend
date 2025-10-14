import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-lb3d.vercel.app/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
