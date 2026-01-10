import api from "./axiosConfig";

export const userService = {
    updateProfile: async (data) => {
        const response = await api.put("/user/profile", data);
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get("/user/me");
        return response.data;
    },

    getVehicles: async () => {
        const response = await api.get("/user/vehicles");
        return response.data;
    },

    addVehicle: async (data) => {
        const response = await api.post("/user/vehicles", data);
        return response.data;
    },

    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post("/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.fileUrl || response.data;
    },

    deleteVehicle: async (id) => {
        await api.delete(`/user/vehicles/${id}`);
    },

    updateVehicle: async (id, data) => {
        const response = await api.put(`/user/vehicles/${id}`, data);
        return response.data;
    }
};
