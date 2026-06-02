import axios from "axios";
import { logout } from "../store/slices/authSlice";
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

// REQUEST interceptor
axiosInstance.interceptors.request.use((config) => {
  // read from Redux first, fallback to localStorage
  const token =
    store?.getState().auth?.accessToken || localStorage.getItem("accessToken");

  console.log("TOKEN BEING SENT TO BACKEND:", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// RESPONSE interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/api/auth/login");

    // only redirect to login on 401 if it's NOT the login request itself
    if (error.response?.status === 401 && !isLoginRequest) {
      if (store) {
        store.dispatch(logout());
      }
      window.location.href = "/login";
    }

    if (error.response?.status === 500) {
      console.error("CRITICAL BACKEND ERROR DATA:", error.response.data);
    }

    return Promise.reject(error);
  },
);

export { axiosInstance };
