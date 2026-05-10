import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000",
});

// Add a request interceptor to attach the auth token
api.interceptors.request.use(
  (config) => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
