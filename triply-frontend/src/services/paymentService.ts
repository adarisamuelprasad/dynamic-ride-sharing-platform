import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:8082/api/payments';

export const processPayment = async (bookingId: number, amount: number, paymentMethod: string) => {
    const user = authService.currentUser;
    if (!user) throw new Error("User not logged in");

    try {
        const response = await axios.post(`${API_URL}/process`, {
            bookingId,
            amount,
            paymentMethod,
            stripeToken: "tok_visa_mock" // Mock token
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

export interface PaymentReport {
    totalRevenue?: number;
    totalTransactions?: number;
    walletBalance?: number;
    totalEarnings?: number;
    totalSpent?: number;
    transactions?: any[];
    earningsHistory?: any[];
    bookings?: any[];
}

export const paymentService = {
    getReport: async (): Promise<PaymentReport> => {
        const user = authService.currentUser;
        if (!user) return {};

        try {
            const response = await axios.get(`${API_URL}/report`, {
                params: {
                    userId: user.id,
                    role: user.role
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching report", error);
            return {};
        }
    },

    confirmStripePayment: async (paymentIntentId: string) => {
        try {
            const response = await axios.post(`${API_URL}/confirm-stripe`, { paymentIntentId });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    downloadReport: () => {
        console.log("Downloading CSV...");
        // Implement CSV download logic here if needed
    },

    downloadReportPdf: () => {
        console.log("Downloading PDF...");
        // Implement PDF download logic here if needed
    }
};
