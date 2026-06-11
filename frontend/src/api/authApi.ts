import { axiosInstance } from "@/api/axiosInstance";
import type { LoginRequest, LoginResponse } from "@/types/auth.types";

const authApi = {
  // makes POST /auth/login
  // returns tokens + user info
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>("/auth/login", credentials);
    return response.data;
  },

  // makes POST /auth/logout
  // tells backend to kill the refresh token
  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },
};

export default authApi;
