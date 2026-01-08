import api from "./axiosConfig";

export interface ReviewRequest {
    rideId: number;
    revieweeId: number;
    rating: number;
    comment: string;
}

export interface Review {
    id: number;
    reviewer: any;
    reviewee: any;
    ride: any;
    rating: number;
    comment: string;
    createdAt: string;
}

export const reviewService = {
    addReview: async (data: ReviewRequest) => {
        const response = await api.post("/reviews", data);
        return response.data;
    },

    getUserReviews: async (userId: number) => {
        const response = await api.get(`/reviews/user/${userId}`);
        return response.data;
    }
};
