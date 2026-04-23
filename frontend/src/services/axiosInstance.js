import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_API,
    timeout: 5000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
      const token = localStorage.getItem("access");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/token/refresh/')
      ) {
        originalRequest._retry = true;

        try {
          const response = await axiosInstance.post("/token/refresh/");
          const newAccess = response.data.access;
          localStorage.setItem("access", newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.warn("Refresh token falló:", refreshError);
          localStorage.removeItem("access");
          window.location.href = "/form";
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
);

export default axiosInstance;
