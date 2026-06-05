import axios from "axios";
import { logout, updateTokens } from "../store/slices/authSlice";
import type { AppStore } from "../store/index";

let store: AppStore | undefined;

export const injectStore = (_store: AppStore) => {
  store = _store;
};

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST interceptor — injecte le token dans chaque requête
axiosInstance.interceptors.request.use((config) => {
  const token =
    store?.getState().auth?.accessToken || localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// queue pour les requêtes qui attendent pendant le refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

// RESPONSE interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isLoginRequest = originalRequest?.url?.includes("/api/auth/login");
    const isRefreshRequest =
      originalRequest?.url?.includes("/api/auth/refresh");

    // si 401 et c'est pas login/refresh → essaie de refresh le token
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !isLoginRequest &&
      !isRefreshRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken =
        store?.getState().auth?.refreshToken ||
        localStorage.getItem("refreshToken");

      // pas de refresh token → logout direct
      if (!refreshToken) {
        store?.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // si un refresh est déjà en cours → met la requête en queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axiosInstance.post("/api/auth/refresh", {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefresh } = res.data;

        // met à jour localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefresh);

        // met à jour Redux
        store?.dispatch(
          updateTokens({ accessToken, refreshToken: newRefresh }),
        );

        // relance toutes les requêtes en attente
        processQueue(null, accessToken);

        // relance la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store?.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 500) {
      console.error("CRITICAL BACKEND ERROR DATA:", error.response.data);
    }

    return Promise.reject(error);
  },
);

export { axiosInstance };
