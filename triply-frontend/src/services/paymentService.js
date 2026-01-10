import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:8081/api/payments';

export const processPayment = async (bookingId, amount, paymentMethod, stripeToken = null) => {
    const user = authService.currentUser;
    if (!user) throw new Error("User not logged in");

    try {
        const response = await axios.post(`${API_URL}/process`, {
            bookingId,
            amount: amount,
            paymentMethod,
            stripeToken
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getPassengerHistory = async () => {
    const user = authService.currentUser;
    if (!user) return [];

    try {
        const response = await axios.get(`${API_URL}/history/passenger/${user.id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching history", error);
        return [];
    }
};

export const getDriverHistory = async () => {
    const user = authService.currentUser;
    if (!user) return [];

    try {
        const response = await axios.get(`${API_URL}/history/driver/${user.id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching driver history", error);
        return [];
    }
};

export const paymentService = {
    getReport: async (role) => {
        const user = authService.currentUser;
        if (!user) return {};

        try {
            const response = await axios.get(`${API_URL}/report`, {
                params: {
                    userId: user.id,
                    role: role
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching report", error);
            return {};
        }
    },

    confirmStripePayment: async (paymentIntentId) => {
        try {
            const response = await axios.post(`${API_URL}/confirm-stripe`, { paymentIntentId });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    downloadReport: async () => {
        console.log("Downloading CSV...");
        // Implement CSV download logic here if needed
        // For example: window.open(`${API_URL}/report/csv?userId=${authService.currentUser.id}`, '_blank');
    },

    downloadReportPdf: async () => {
        console.log("Downloading PDF...");
        // Implement PDF download logic here if needed
    }
};
