import axios from './axiosConfig';

const API_BASE = 'http://localhost:8081/api/auth';

export const authService = {
    currentUser: null,
    listeners: [],

    init() {
        const stored = localStorage.getItem('triply_user');
        const token = localStorage.getItem('triply_token');
        if (stored && token) {
            this.currentUser = JSON.parse(stored);
        }
    },

    subscribe(listener) {
        this.listeners.push(listener);
        // Call immediately with current state
        listener(this.currentUser);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    },

    notify() {
        this.listeners.forEach(l => l(this.currentUser));
    },

    async login(email, password) {
        const response = await axios.post(`${API_BASE}/login`, { email, password });
        const data = response.data;
        localStorage.setItem('triply_token', data.token);
        localStorage.setItem('triply_user', JSON.stringify(data));
        this.currentUser = data;
        this.notify();
        return data;
    },

    async register(payload) {
        const response = await axios.post(`${API_BASE}/register`, payload);
        const data = response.data;
        localStorage.setItem('triply_token', data.token);
        localStorage.setItem('triply_user', JSON.stringify(data));
        this.currentUser = data;
        this.notify();
        return data;
    },

    logout() {
        localStorage.removeItem('triply_token');
        localStorage.removeItem('triply_user');
        this.currentUser = null;
        this.notify();
    },

    isLoggedIn() {
        return !!this.currentUser;
    },

    getToken() {
        return localStorage.getItem('triply_token');
    },

    async updatePassword(data) {
        return await axios.put('http://localhost:8081/api/auth/update-password', data);
    }
};

// Initialize auth service
authService.init();
