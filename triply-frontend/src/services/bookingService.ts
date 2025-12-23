import axios from './axiosConfig';
import { Ride } from './rideService';

const API_BASE = 'http://localhost:8082/api/bookings';

export interface Booking {
    id: number;
    seatsBooked: number;
    status: string;
    paymentMethod?: string;
    pickupLat?: number;
    pickupLng?: number;
    dropoffLat?: number;
    dropoffLng?: number;
    fareAmount?: number;
    passenger: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    ride: Ride;
}

export interface BookingResponse {
    booking: Booking;
    clientSecret?: string;
}

export const bookingService = {
    async bookRide(
        rideId: number,
        seatsBooked: number,
        paymentMethod: string = 'CASH',
        locations?: { pickupLat: number, pickupLng: number, dropoffLat: number, dropoffLng: number }
    ): Promise<Booking | BookingResponse> {
        const response = await axios.post<Booking | BookingResponse>(`${API_BASE}/book`, {
            rideId,
            seatsBooked,
            paymentMethod,
            ...locations
        });
        return response.data;
    },

    async getMyBookings(): Promise<Booking[]> {
        const response = await axios.get<Booking[]>(`${API_BASE}/my`);
        return response.data;
    },

    async cancelBooking(bookingId: number): Promise<Booking> {
        const response = await axios.post<Booking>(`${API_BASE}/cancel/${bookingId}`);
        return response.data;
    }
};
