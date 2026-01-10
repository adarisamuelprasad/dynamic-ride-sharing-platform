import axios from './axiosConfig';

const API_BASE = 'http://localhost:8081/api/rides';

export const rideService = {
    async searchRides(params) {
        // Remove empty/null values from params
        const cleanParams = Object.fromEntries(
            Object.entries(params || {}).filter(([_, v]) => v != null && v !== '')
        );
        const queryString = new URLSearchParams(cleanParams).toString();
        const response = await axios.get(`${API_BASE}/search?${queryString}`);
        return response.data;
    },

    async getMyRides() {
        const response = await axios.get(`${API_BASE}/my-rides`);
        return response.data;
    },

    async getAllRides() {
        const response = await axios.get(API_BASE);
        return response.data;
    },

    async postRide(rideData) {
        const response = await axios.post(`${API_BASE}/post`, rideData);
        return response.data;
    },

    async updateRide(id, rideData) {
        const response = await axios.put(`${API_BASE}/${id}`, rideData);
        return response.data;
    },

    async deleteRide(id) {
        const response = await axios.delete(`${API_BASE}/${id}`);
        return response.data;
    },

    async calculateFare(source, destination) {
        const response = await axios.get(`${API_BASE}/calculate-fare`, {
            params: { source, destination }
        });
        return response.data;
    },

    async autocomplete(query) {
        const response = await axios.get(`${API_BASE}/autocomplete`, {
            params: { query }
        });
        return response.data;
    }
};
