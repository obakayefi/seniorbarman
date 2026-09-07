import axios from 'axios'

const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== "undefined") {
            if (!error.response || error.code === "ERR_NETWORK" || !navigator.onLine) {
                window.dispatchEvent(new Event("app:offline"));
            }
        }
        return Promise.reject(error);
    }
);

export default api