// Configuration for API URL
// In development, it uses localhost:3000
// In production, it will use the environment variable or the current domain

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default API_URL;
