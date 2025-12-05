import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/auth';

export const authService = {
    currentUser: null,

    init() {
        const stored = localStorage.getItem('triply_user');
        const token = localStorage.getItem('triply_token');
        if (stored && token) {
            this.currentUser = JSON.parse(stored);
        }
    },

    async login(email, password) {
        const response = await axios.post(`${API_BASE}/login`, { email, password });
        const data = response.data;
        localStorage.setItem('triply_token', data.token);
        localStorage.setItem('triply_user', JSON.stringify(data));
        this.currentUser = data;
        return data;
    },

    async register(payload) {
        const response = await axios.post(`${API_BASE}/register`, payload);
        const data = response.data;
        localStorage.setItem('triply_token', data.token);
        localStorage.setItem('triply_user', JSON.stringify(data));
        this.currentUser = data;
        return data;
    },

    logout() {
        localStorage.removeItem('triply_token');
        localStorage.removeItem('triply_user');
        this.currentUser = null;
    },

    isLoggedIn() {
        return !!this.currentUser;
    },

    getToken() {
        return localStorage.getItem('triply_token');
    }
};

// Initialize auth service
authService.init();
