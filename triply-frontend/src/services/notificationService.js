import axios from './axiosConfig.js';

const API_BASE = 'http://localhost:8081/api/notifications';

export const notificationService = {
    async getUserNotifications() {
        const response = await axios.get(API_BASE);
        return response.data;
    },

    async markAsRead(id) {
        const response = await axios.put(`${API_BASE}/${id}/read`);
        return response.data;
    }
};
