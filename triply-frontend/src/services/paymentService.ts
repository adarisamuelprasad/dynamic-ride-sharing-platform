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
