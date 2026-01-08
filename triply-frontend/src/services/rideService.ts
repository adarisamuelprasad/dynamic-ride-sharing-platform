import axios from './axiosConfig';
import { Review } from './reviewService';

const API_BASE = 'http://localhost:8081/api/rides';

export interface Ride {
    id: number;
    source: string;
    destination: string;
    departureTime: string;
    availableSeats: number;
    farePerSeat: number;
    sourceLat?: number;
    sourceLng?: number;
    destLat?: number;
    destLng?: number;
    distanceKm?: number;
    driver: {
        id: number;
        name: string;
        email: string;
        phone: string;
        vehicleModel: string;
        licensePlate: string;
        capacity: number;
        driverVerified: boolean;
        averageRating?: number;
        reviewCount?: number;
    };
    vehicleModel?: string;
    vehiclePlate?: string;
    vehicleImage?: string;
    acAvailable?: boolean;
    sunroofAvailable?: boolean;
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
    instantBooking?: boolean;
    maxTwoInBack?: boolean;
    extraImages?: string[];
    status?: string;
    reviews?: Review[];
}

export interface RideRequest {
    source: string;
    destination: string;
    departureTime: string;
    availableSeats: number;
    farePerSeat: number;
    sourceLat?: number;
    sourceLng?: number;
    destLat?: number;
    destLng?: number;
    vehicleId?: number;
    extraImages?: string[];
    // Allow updating other fields optionally
    model?: string;
    plateNumber?: string;
    imageUrl?: string;
    acAvailable?: boolean;
    sunroofAvailable?: boolean;
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
    instantBooking?: boolean;
    maxTwoInBack?: boolean;
}

export interface SearchParams {
    source: string;
    destination: string;
    date?: string;
    minFare?: number;
    maxFare?: number;
    vehicleModel?: string;
}

export const rideService = {
    async searchRides(params: SearchParams): Promise<Ride[]> {
        // Remove empty/null values from params
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null && v !== '')
        );
        const queryString = new URLSearchParams(cleanParams as any).toString();
        const response = await axios.get<Ride[]>(`${API_BASE}/search?${queryString}`);
        return response.data;
    },

    async getMyRides(): Promise<Ride[]> {
        const response = await axios.get<Ride[]>(`${API_BASE}/my-rides`);
        return response.data;
    },

    async getAllRides(): Promise<Ride[]> {
        const response = await axios.get<Ride[]>(API_BASE);
        return response.data;
    },

    async postRide(rideData: RideRequest): Promise<Ride> {
        const response = await axios.post<Ride>(`${API_BASE}/post`, rideData);
        return response.data;
    },

    async updateRide(id: number, rideData: Partial<RideRequest>): Promise<Ride> {
        const response = await axios.put<Ride>(`${API_BASE}/${id}`, rideData);
        return response.data;
    }
};
