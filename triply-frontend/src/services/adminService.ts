import axios from './axiosConfig';
import { Ride } from './rideService';
import { Booking } from './bookingService';

const API_BASE = 'http://localhost:8082/api/admin';

export interface User {
    id: number;
    email: string;
    name: string;
    phone: string;
    role: string;
    blocked: boolean;
    driverVerified: boolean;
    vehicleModel?: string;
    licensePlate?: string;
    capacity?: number;
}

export interface UpdateUserRequest {
    name?: string;
    phone?: string;
    blocked?: boolean;
    driverVerified?: boolean;
    vehicleModel?: string;
    licensePlate?: string;
    capacity?: number;
    role?: string;
}

export const adminService = {
    // User Management
    async getAllUsers(): Promise<User[]> {
        const response = await axios.get<User[]>(`${API_BASE}/users`);
        return response.data;
    },

    async updateUser(userId: number, userData: UpdateUserRequest): Promise<User> {
        const response = await axios.put<User>(`${API_BASE}/users/${userId}`, userData);
        return response.data;
    },

    async deleteUser(userId: number): Promise<void> {
        await axios.delete(`${API_BASE}/users/${userId}`);
    },

    async blockUser(userId: number, blocked: boolean): Promise<void> {
        await axios.post(`${API_BASE}/users/${userId}/block?blocked=${blocked}`);
    },

    async verifyDriver(userId: number): Promise<void> {
        await axios.post(`${API_BASE}/users/${userId}/verify-driver`);
    },

    // Ride Management
    async getAllRides(): Promise<Ride[]> {
        const response = await axios.get<Ride[]>(`${API_BASE}/rides`);
        return response.data;
    },

    // Booking Management
    async getAllBookings(): Promise<Booking[]> {
        const response = await axios.get<Booking[]>(`${API_BASE}/bookings`);
        return response.data;
    }
};
