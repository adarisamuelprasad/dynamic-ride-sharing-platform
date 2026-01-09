import axios from './axiosConfig';


const API_BASE = 'http://localhost:8081/api/admin';

export const adminService = {
    // User Management
    async getAllUsers(page = 0, size = 10) {
        const response = await axios.get(`${API_BASE}/users`, { params: { page, size } });
        return response.data;
    },

    async updateUser(userId, userData) {
        const response = await axios.put(`${API_BASE}/users/${userId}`, userData);
        return response.data;
    },

    async deleteUser(userId) {
        await axios.delete(`${API_BASE}/users/${userId}`);
    }, async blockUser(userId, blocked) {
        await axios.post(`${API_BASE}/users/${userId}/block?blocked=${blocked}`);
    },

    async verifyDriver(userId) {
        await axios.post(`${API_BASE}/users/${userId}/verify-driver`);
    },

    // Ride Management
    async getAllRides(page = 0, size = 10) {
        const response = await axios.get(`${API_BASE}/rides`, { params: { page, size } });
        return response.data;
    },

    // Booking Management
    async getAllBookings(page = 0, size = 10) {
        const response = await axios.get(`${API_BASE}/bookings`, { params: { page, size } });
        return response.data;
    },

    // Rude/Flagged Activity
    async getRudeReviews(page = 0, size = 10) {
        // Ensure backend has this endpoint logic mapped to Rating < 3
        const response = await axios.get(`${API_BASE}/rude-activity`, { params: { page, size } });
        return response.data;
    }
};
