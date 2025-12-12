import axios from 'axios';

// Set default base URL for the backend
axios.defaults.baseURL = 'http://localhost:8082/api';

// Add auth token to all requests
axios.interceptors.request.use(
    (config) => {
        // Get token directly from localStorage to avoid circular dependency
        const token = localStorage.getItem('triply_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle 401 errors globally
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('triply_token');
            localStorage.removeItem('triply_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axios;
