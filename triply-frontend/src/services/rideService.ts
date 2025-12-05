import axios from './axiosConfig';

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
    driver: {
        id: number;
        name: string;
        email: string;
        phone: string;
        vehicleModel: string;
        licensePlate: string;
        capacity: number;
        driverVerified: boolean;
    };
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

    async getAllRides(): Promise<Ride[]> {
        const response = await axios.get<Ride[]>(API_BASE);
        return response.data;
    },

    async postRide(rideData: RideRequest): Promise<Ride> {
        const response = await axios.post<Ride>(`${API_BASE}/post`, rideData);
        return response.data;
    }
};
