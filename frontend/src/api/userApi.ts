import { axiosInstance } from "@/api/axiosInstance";
import type { AxiosResponse } from "axios";

import type {
  UserResponse,
  SpringPageWrapper,
  UserRequest,
} from "@/types/user.types";

export const userApi = {
  getAll: (search = "", page = 0, size = 10) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", page.toString());
    params.append("size", size.toString());

    return axiosInstance
      .get<
        SpringPageWrapper<UserResponse>
      >(`/api/users?${params.toString()}`)
      .then(
        (res: AxiosResponse<SpringPageWrapper<UserResponse>>) => res.data,
      );
  },

  getById: (id: number) =>
    axiosInstance
      .get<UserResponse>(`/api/users/${id}`)
      .then((res: AxiosResponse<UserResponse>) => res.data),

  create: (payload: UserRequest) =>
    axiosInstance
      .post<UserResponse>("/api/users", payload)
      .then((res) => res.data),

  update: (id: number, payload: UserRequest) =>
    axiosInstance
      .put<UserResponse>(`/api/users/${id}`, payload)
      .then((res) => res.data),

  toggleEnabled: (id: number) =>
    axiosInstance
      .patch<UserResponse>(`/api/users/${id}/toggle`)
      .then((res: AxiosResponse<UserResponse>) => res.data),

  delete: (id: number) => axiosInstance.delete(`/api/users/${id}`),

  getMyProfile: () =>
    axiosInstance.get<UserResponse>("/api/users/me").then((res) => res.data),

  updateMyProfile: (payload: {
    nom?: string;
    prenom?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) =>
    axiosInstance
      .put<UserResponse>("/api/users/me", payload)
      .then((res) => res.data),
};
