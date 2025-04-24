import axiosInstance from './axiosInstance';

const token = localStorage.getItem("access");

export const postAnalogData = async (analogData) => {
    try {
        const response = await axiosInstance.post('/sensor/analog', analogData);
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

export const getUserReadings = async () => {
    try {
        const response = await axiosInstance.get('/sensor/user-readings');
        return response.data;
    } catch (error) {
        throw new Error('Error getting user readings', error);
    }
};

export const getAllReadings = async () => {
    try {
        const response = await axiosInstance.get('/sensor/all-readings');
        return response.data;
    } catch (error) {
        throw new Error('Error getting all readings', error)
    }
};