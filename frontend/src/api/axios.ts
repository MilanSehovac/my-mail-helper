import axios from 'axios';

const baseURL = import.meta.env.VITE_DEV_API_URL

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