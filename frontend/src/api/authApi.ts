import { axiosInstance } from "@/api/axiosInstance";
import type { LoginRequest, LoginResponse } from "@/types/auth.types";

const authApi = {
  // makes POST /api/auth/login
  // returns tokens + user info
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      "/api/auth/login",
      credentials,
    );
    return response.data;
  },

  // makes POST /api/auth/logout
  // tells backend to kill the refresh token
  logout: async (): Promise<void> => {
    await axiosInstance.post("/api/auth/logout");
  },
};

export default authApi;
