import axios from './axiosConfig';

const API_BASE = 'http://localhost:8080/api/auth';

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: 'DRIVER' | 'PASSENGER';
    vehicleModel?: string;
    licensePlate?: string;
    capacity?: number;
}

interface AuthResponse {
    token: string;
    type: string;
    id: number;
    email: string;
    role: string;
    name: string;
}

export const authService = {
    currentUser: null as AuthResponse | null,

    init() {
        const stored = localStorage.getItem('triply_user');
        const token = localStorage.getItem('triply_token');
        if (stored && token) {
            this.currentUser = JSON.parse(stored);
        }
    },

    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await axios.post<AuthResponse>(`${API_BASE}/login`, { email, password });
        const data = response.data;
        localStorage.setItem('triply_token', data.token);
        localStorage.setItem('triply_user', JSON.stringify(data));
        this.currentUser = data;
        return data;
    },

    async register(payload: RegisterRequest): Promise<AuthResponse> {
        const response = await axios.post<AuthResponse>(`${API_BASE}/register`, payload);
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

    isLoggedIn(): boolean {
        return !!this.currentUser;
    },

    getToken(): string | null {
        return localStorage.getItem('triply_token');
    }
};

// Initialize auth service
authService.init();
