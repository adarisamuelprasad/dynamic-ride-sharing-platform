import api from "./axiosConfig";

export const reviewService = {
    addReview: async (data) => {
        const response = await api.post("/reviews", data);
        return response.data;
    },

    getUserReviews: async (userId) => {
        const response = await api.get(`/reviews/user/${userId}`);
        return response.data;
    }
};
