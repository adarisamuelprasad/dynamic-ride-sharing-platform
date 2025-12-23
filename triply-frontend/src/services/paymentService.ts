import axios from './axiosConfig';

const API_BASE = 'http://localhost:8082/api/payments';

export interface PaymentRecord {
    id: number;
    amount: number;
    status: string;
    type: string;
    transactionId: string;
    createdAt: string;
    booking: {
        id: number;
        ride: {
            source: string;
            destination: string;
        };
    };
}

export interface PaymentReport {
    totalRevenue?: number;
    totalTransactions?: number;
    totalEarnings?: number;
    walletBalance?: number;
    totalSpent?: number;
    transactions?: PaymentRecord[];
    earningsHistory?: PaymentRecord[];
    bookings?: PaymentRecord[];
}

export const paymentService = {
    async getHistory(): Promise<PaymentRecord[]> {
        const response = await axios.get<PaymentRecord[]>(`${API_BASE}/history`);
        return response.data;
    },

    async getReport(): Promise<PaymentReport> {
        const response = await axios.get<PaymentReport>(`${API_BASE}/report`);
        return response.data;
    },

    async downloadReport(): Promise<void> {
        const response = await axios.get(`${API_BASE}/download`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'payment_report.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};
