import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const SERVER_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        // Strip leading slash from the URL to prevent it from overriding the baseURL prefix (/api)
        if (config.url && config.url.startsWith('/')) {
            config.url = config.url.substring(1);
        }

        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user && user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        } else if (storedToken) {
            config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
