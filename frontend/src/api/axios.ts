import axios from 'axios';

// Local dev points at the API via VITE_DEV_API_URL; deployed, the API shares the
// frontend's domain under /api (see vercel.json), so a relative URL is correct.
const baseURL = import.meta.env.VITE_DEV_API_URL || '/api'

const API = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/auth') {
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

export default API;