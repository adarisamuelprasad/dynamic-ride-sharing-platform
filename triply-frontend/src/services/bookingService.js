import axios from './axiosConfig.js';

const API_BASE = 'http://localhost:8081/api/bookings';

export const bookingService = {
    async bookRide(rideId, seatsBooked, paymentMethod = "CASH") {
        const response = await axios.post(`${API_BASE}/book`, {
            rideId,
            seatsBooked,
            paymentMethod
        });
        return response.data;
    },

    async getMyBookings() {
        const response = await axios.get(`${API_BASE}/my`);
        return response.data;
    },

    async downloadReport() {
        const response = await axios.get(`${API_BASE}/download`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'booking_report.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    async downloadReportPdf() {
        const response = await axios.get(`${API_BASE}/download/pdf`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'booking_report.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    async getDriverRequests() {
        const response = await axios.get(`${API_BASE}/driver-requests`);
        return response.data;
    },

    async respondToBooking(bookingId, status) {
        const response = await axios.put(`${API_BASE}/${bookingId}/respond`, null, {
            params: { status }
        });
        return response.data;
    },

    async finalizePayment(bookingId, paymentMethod) {
        const response = await axios.post(`${API_BASE}/${bookingId}/pay`, {
            paymentMethod
        });
        return response.data;
    },

    async confirmPayment(bookingId, paymentIntentId) {
        const response = await axios.post(`${API_BASE}/${bookingId}/confirm-payment`, null, {
            params: { paymentIntentId }
        });
        return response.data;
    },

    async cancelBooking(bookingId) {
        const response = await axios.post(`${API_BASE}/cancel/${bookingId}`);
        return response.data;
    }
};
