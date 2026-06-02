import { axiosInstance } from "./axiosInstance";
import type { AxiosResponse } from "axios";

import type {
  UserResponseDTO,
  SpringPageWrapper,
  UserRequestDTO,
} from "../types/user.types";

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

  create: (payload: UserRequestDTO) =>
    axiosInstance
      .post<UserResponseDTO>("/api/users", payload)
      .then((res) => res.data),

  update: (id: number, payload: UserRequestDTO) =>
    axiosInstance
      .put<UserResponseDTO>(`/api/users/${id}`, payload)
      .then((res) => res.data),

  toggleEnabled: (id: number) =>
    axiosInstance
      .patch<UserResponseDTO>(`/api/users/${id}/toggle`)
      .then((res: AxiosResponse<UserResponseDTO>) => res.data),

  delete: (id: number) => axiosInstance.delete(`/api/users/${id}`),
};
