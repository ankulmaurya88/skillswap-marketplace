import axios from "axios";

const baseURL =import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

// Separate client to avoid refresh-interceptor loops
const refreshClient = axios.create({ baseURL });
const api = axios.create({ baseURL });

export const clearTokens = () => {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
};

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      original.url?.includes("auth/login/")
    ) {
      return Promise.reject(error);
    }

    const refresh = sessionStorage.getItem("refresh_token");

    if (!refresh) {
      clearTokens();
      window.dispatchEvent(new Event("auth:expired"));
      return Promise.reject(error);
    }

    original._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshClient
        .post("auth/refresh/", { refresh })
        .then(({ data }) => {
          sessionStorage.setItem("access_token", data.access);

          if (data.refresh) {
            sessionStorage.setItem("refresh_token", data.refresh);
          }

          return data.access;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      const newAccess = await refreshPromise;
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (refreshError) {
      clearTokens();
      window.dispatchEvent(new Event("auth:expired"));
      return Promise.reject(refreshError);
    }
  }
);

export default api;