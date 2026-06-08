import { axiosInstance } from "@/api/axiosInstance";
import type {
  DirectionResponseDTO,
  DivisionResponseDTO,
  ServiceResponseDTO,
} from "@/types/structure.types";
import type { AxiosResponse } from "axios";

export const structureApi = {
  getDirections: () =>
    axiosInstance
      .get<DirectionResponseDTO[]>("/api/directions")
      .then((res: AxiosResponse<DirectionResponseDTO[]>) => res.data),

  getDivisions: () =>
    axiosInstance
      .get<DivisionResponseDTO[]>("/api/divisions")
      .then((res: AxiosResponse<DivisionResponseDTO[]>) => res.data),

  getServices: () =>
    axiosInstance
      .get<ServiceResponseDTO[]>("/api/services")
      .then((res: AxiosResponse<ServiceResponseDTO[]>) => res.data),

  // ⚡ Added endpoint to fetch real database roles seamlessly
  getRoles: () =>
    axiosInstance
      .get<{ id: number; name: string }[]>("/api/roles")
      .then((res: AxiosResponse<{ id: number; name: string }[]>) => res.data),

  createDirection: (nom: string) =>
    axiosInstance
      .post<DirectionResponseDTO>("/api/directions", {
        nom,
        code: nom.substring(0, 3).toUpperCase(),
      })
      .then((res: AxiosResponse<DirectionResponseDTO>) => res.data),

  createDivision: (directionId: number, nom: string) =>
    axiosInstance
      .post<DivisionResponseDTO>("/api/divisions", {
        nom,
        directionId,
        code: nom.substring(0, 3).toUpperCase(),
      })
      .then((res: AxiosResponse<DivisionResponseDTO>) => res.data),

  createService: (divisionId: number, nom: string) =>
    axiosInstance
      .post<ServiceResponseDTO>("/api/services", {
        nom,
        divisionId,
        code: nom.substring(0, 3).toUpperCase(),
      })
      .then((res: AxiosResponse<ServiceResponseDTO>) => res.data),

  updateDirection: (id: number, nom: string) =>
    axiosInstance
      .put<DirectionResponseDTO>(`/api/directions/${id}`, {
        nom,
        code: "UPDATED",
      })
      .then((res: AxiosResponse<DirectionResponseDTO>) => res.data),

  updateDivision: (id: number, directionId: number, nom: string) =>
    axiosInstance
      .put<DivisionResponseDTO>(`/api/divisions/${id}`, {
        nom,
        directionId,
        code: "UPDATED",
      })
      .then((res: AxiosResponse<DivisionResponseDTO>) => res.data),

  updateService: (id: number, divisionId: number, nom: string) =>
    axiosInstance
      .put<ServiceResponseDTO>(`/api/services/${id}`, {
        nom,
        divisionId,
        code: "UPDATED",
      })
      .then((res: AxiosResponse<ServiceResponseDTO>) => res.data),

  deleteDirection: (id: number) =>
    axiosInstance.delete(`/api/directions/${id}`),
  deleteDivision: (id: number) => axiosInstance.delete(`/api/divisions/${id}`),
  deleteService: (id: number) => axiosInstance.delete(`/api/services/${id}`),
};
