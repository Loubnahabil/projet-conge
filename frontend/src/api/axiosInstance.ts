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
  // 1. Try to get the token directly from the Redux state
  let token = store?.getState().auth?.accessToken;

  // 2. Fail-safe: If Vite eagerly mounts routes before Redux injects, fallback to localStorage
  if (!token) {
    const rawAuth = localStorage.getItem("auth");
    const persistedAuth = localStorage.getItem("persist:auth");

    if (rawAuth) {
      try {
        const parsed = JSON.parse(rawAuth);
        token = parsed.accessToken || parsed.token || parsed;
      } catch {
        token = rawAuth;
      }
    } else if (persistedAuth) {
      try {
        const parsedPersist = JSON.parse(persistedAuth);
        if (parsedPersist.auth) {
          const innerAuth = JSON.parse(parsedPersist.auth);
          token = innerAuth.accessToken || innerAuth.token;
        } else {
          token = parsedPersist.accessToken || parsedPersist.token;
        }
      } catch {
        // Safe fall-through if parsing fails
      }
    }
  }

  // 🔴 TEST LOG: Look at your F12 browser console tab to see what this prints!
  console.log("🚀 TOKEN BEING SENT TO BACKEND:", token);

  // 3. Attach the token securely to authorization headers if found
  if (token) {
    const cleanToken =
      typeof token === "string" ? token.replace(/^"(.*)"$/, "$1") : token;
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }

  return config;
});

// RESPONSE interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Handle regular 401 Unauthorized errors
    if (error.response?.status === 401) {
      if (store) {
        store.dispatch(logout());
      }
      window.location.href = "/login";
    }

    // 2. 🚨 CAPTURE THE SILENT 500 CRASH DETAILS DIRECTLY
    if (error.response?.status === 500) {
      console.error("❌ CRITICAL BACKEND ERROR DATA:", error.response.data);
      alert(
        "SERVER CRASHED: Check your F12 console object 'CRITICAL BACKEND ERROR DATA' to see the Java text details!",
      );
    }

    return Promise.reject(error);
  },
);

export { axiosInstance };
