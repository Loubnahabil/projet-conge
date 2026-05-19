import axios from "axios";
import { logout } from "../store/slices/authSlice";
// 1. Import the type safely using 'import type'
import type { AppStore } from "../store/index";

// 2. Change 'any' to 'AppStore' (and allow it to be undefined initially)
let store: AppStore | undefined;

// 3. Strongly type the helper function argument
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
  // Optional chaining (?.) handles the 'undefined' state gracefully before boot
  const token = store?.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (store) {
        store.dispatch(logout());
      }
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export { axiosInstance };
