import axios from 'axios';

// Force relative paths in production to prevent Axios from doubling the /api prefix,
// while maintaining development fallback to the API gateway.
const baseURL = import.meta.env.MODE === 'production' 
  ? '' 
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086');

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;