import axiosInstance from './axiosInstance';

export const postAnalogData = async (analogData) => {
    try {
        const response = await axiosInstance.post('/analog', analogData);
        return response.data;
    } catch (error) {
        throw new Error('Error posting data:', error);
    }
};