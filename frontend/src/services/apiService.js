import axiosInstance from './axiosInstance';

export const postAnalogData = async (analogData) => {
    try {
        const response = await axiosInstance.post('/sensor/analog', analogData);
        return response.data;
    } catch (error) {
        throw new Error('Error posting data:', error);
    }
};

export const patchAnalogData = async (id, analogData) => {
    try {
        const response = await axiosInstance.patch(`/sensor/analog/${id}`, analogData);
        return response.data;
    } catch (error) {
        throw new Error('Error patching data:', error);
    }
};

// Login with JWT — refresh token is set as httpOnly cookie by the backend
export const loginUser = async (email, password) => {
    const response = await axiosInstance.post("/token/", { email, password });
    return response.data;
};

export const logoutUser = async () => {
    await axiosInstance.post("/logout/");
};

export const getMe = async () => {
    const response = await axiosInstance.get("/users/me/");
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

export const getSessionReadings = async (sessionId) => {
    try {
        const response = await axiosInstance.get(`/sensor/session-readings/${sessionId}`);
        return response.data;
    } catch (error) {
        throw new Error('Error getting session readings', error);
    }
};

export const deleteSessionReading = async (sessionId) => {
    try {
        await axiosInstance.delete(`/sensor/session/${sessionId}`);
    } catch (error) {
        throw new Error('Error deleting session reading', error);
    }
};

export const getLakes = async () => {
    try {
        const response = await axiosInstance.get('/sensor/lakes');
        return response.data;
    } catch (error) {
        throw new Error('Error getting lakes', error);
    }
};

export const getAllLakeSamples = async () => {
    try {
        const response = await axiosInstance.get('/sensor/all-lake-samples');
        return response.data;
    } catch (error) {
        throw new Error('Error getting all lake samples', error);
    }
};

export const getLakeSamples = async () => {
    try {
        const response = await axiosInstance.get('/sensor/lake-samples');
        return response.data;
    } catch (error) {
        throw new Error('Error getting lake samples', error);
    }
};

export const postLakeSample = async (lakeSampleData) => {
    try {
        const response = await axiosInstance.post('/sensor/lake-samples', lakeSampleData);
        return response.data;
    } catch (error) {
        throw new Error('Error posting lake sample', error);
    }
};

export const patchLakeSample = async (id, lakeSampleData) => {
    try {
        const response = await axiosInstance.patch(`/sensor/lake-samples/${id}`, lakeSampleData);
        return response.data;
    } catch (error) {
        throw new Error('Error patching lake sample', error);
    }
};