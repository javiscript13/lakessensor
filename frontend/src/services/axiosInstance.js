import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.BACKEND_API,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;