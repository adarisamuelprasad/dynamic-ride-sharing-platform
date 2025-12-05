import axios from './axiosConfig';
import { Ride } from './rideService';

const API_BASE = 'http://localhost:8080/api/bookings';

export interface Booking {
    id: number;
    seatsBooked: number;
    status: string;
    passenger: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    ride: Ride;
}

export const bookingService = {
    async bookRide(rideId: number, seatsBooked: number): Promise<Booking> {
        const response = await axios.post<Booking>(`${API_BASE}/book`, {
            rideId,
            seatsBooked
        });
        return response.data;
    },

    async getMyBookings(): Promise<Booking[]> {
        const response = await axios.get<Booking[]>(`${API_BASE}/my`);
        return response.data;
    }
};
