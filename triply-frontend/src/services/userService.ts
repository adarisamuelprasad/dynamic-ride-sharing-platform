import api from "./axiosConfig";

export const userService = {
    updateProfile: async (data: { name: string; phone: string }) => {
        const response = await api.put("/user/profile", data);
        return response.data;
    },

    getVehicles: async () => {
        const response = await api.get("/user/vehicles");
        return response.data;
    },

    addVehicle: async (data: {
        model: string;
        plateNumber: string;
        capacity: number;
        acAvailable?: boolean;
        sunroofAvailable?: boolean;
        imageUrl?: string;
    }) => {
        const response = await api.post("/user/vehicles", data);
        return response.data;
    },

    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post("http://localhost:8082/api/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.fileUrl;
    },

    deleteVehicle: async (id: number) => {
        await api.delete(`/user/vehicles/${id}`);
    },

    updateVehicle: async (id: number, data: any) => {
        const response = await api.put(`/user/vehicles/${id}`, data);
        return response.data;
    }
};
