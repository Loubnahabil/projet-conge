import { axiosInstance } from "./axiosInstance";
import type { UserResponseDTO, SpringPageWrapper } from "../types/user.types";
import type { AxiosResponse } from "axios";

export const userApi = {
  getAll: (search = "", page = 0, size = 10) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", page.toString());
    params.append("size", size.toString());

    return axiosInstance
      .get<
        SpringPageWrapper<UserResponseDTO>
      >(`/api/users?${params.toString()}`)
      .then(
        (res: AxiosResponse<SpringPageWrapper<UserResponseDTO>>) => res.data,
      );
  },

  getById: (id: number) =>
    axiosInstance
      .get<UserResponseDTO>(`/api/users/${id}`)
      .then((res: AxiosResponse<UserResponseDTO>) => res.data),

  // Fixed: Replaced 'any' with Record<string, unknown>
  create: (payload: Record<string, unknown>) =>
    axiosInstance
      .post<UserResponseDTO>("/api/users", payload)
      .then((res: AxiosResponse<UserResponseDTO>) => res.data),

  // Fixed: Replaced 'any' with Record<string, unknown>
  update: (id: number, payload: Record<string, unknown>) =>
    axiosInstance
      .put<UserResponseDTO>(`/api/users/${id}`, payload)
      .then((res: AxiosResponse<UserResponseDTO>) => res.data),

  toggleEnabled: (id: number) =>
    axiosInstance
      .patch<UserResponseDTO>(`/api/users/${id}/toggle`)
      .then((res: AxiosResponse<UserResponseDTO>) => res.data),
};
