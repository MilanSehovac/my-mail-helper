import axios from 'axios';

const baseURL = import.meta.env.VITE_DEV_API_URL

const API = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default API;