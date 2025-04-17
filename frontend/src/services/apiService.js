import axiosInstance from './axiosInstance';

const token = localStorage.getItem("access");

export const postAnalogData = async (analogData) => {
    try {
        const response = await axiosInstance.post('/sensor/analog', analogData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw new Error('Error posting data:', error);
    }
};

// Login with JWT
export const loginUser = async (email, password) => {
    const response = await axiosInstance.post("/token/", { email, password });
    return response.data; 
};