import { axiosInstance } from "@/api/axiosInstance";
import type {
  DirectionResponse,
  DivisionResponse,
  ServiceResponse,
} from "@/types/structure.types";
import type { AxiosResponse } from "axios";

export const structureApi = {
  getDirections: () =>
    axiosInstance
      .get<DirectionResponse[]>("/api/directions")
      .then((res: AxiosResponse<DirectionResponse[]>) => res.data),

  getDivisions: () =>
    axiosInstance
      .get<DivisionResponse[]>("/api/divisions")
      .then((res: AxiosResponse<DivisionResponse[]>) => res.data),

  getServices: () =>
    axiosInstance
      .get<ServiceResponse[]>("/api/services")
      .then((res: AxiosResponse<ServiceResponse[]>) => res.data),

  getDivisionsByDirection: (directionId: number) =>
    axiosInstance
      .get<DivisionResponse[]>(`/api/divisions/by-direction/${directionId}`)
      .then((res: AxiosResponse<DivisionResponse[]>) => res.data),

  getServicesByDivision: (divisionId: number) =>
    axiosInstance
      .get<ServiceResponse[]>(`/api/services/by-division/${divisionId}`)
      .then((res: AxiosResponse<ServiceResponse[]>) => res.data),

  getRoles: () =>
    axiosInstance
      .get<{ id: number; name: string }[]>("/api/roles")
      .then((res: AxiosResponse<{ id: number; name: string }[]>) => res.data),

  createDirection: (nom: string) =>
    axiosInstance
      .post<DirectionResponse>("/api/directions", {
        nom,
        code: nom.substring(0, 3).toUpperCase(),
      })
      .then((res: AxiosResponse<DirectionResponse>) => res.data),

  createDivision: (directionId: number, nom: string) =>
    axiosInstance
      .post<DivisionResponse>("/api/divisions", {
        nom,
        directionId,
        code: nom.substring(0, 3).toUpperCase(),
      })
      .then((res: AxiosResponse<DivisionResponse>) => res.data),

  createService: (divisionId: number, nom: string) =>
    axiosInstance
      .post<ServiceResponse>("/api/services", {
        nom,
        divisionId,
        code: nom.substring(0, 3).toUpperCase(),
      })
      .then((res: AxiosResponse<ServiceResponse>) => res.data),

  updateDirection: (id: number, nom: string) =>
    axiosInstance
      .put<DirectionResponse>(`/api/directions/${id}`, {
        nom,
        code: "UPDATED",
      })
      .then((res: AxiosResponse<DirectionResponse>) => res.data),

  updateDivision: (id: number, directionId: number, nom: string) =>
    axiosInstance
      .put<DivisionResponse>(`/api/divisions/${id}`, {
        nom,
        directionId,
        code: "UPDATED",
      })
      .then((res: AxiosResponse<DivisionResponse>) => res.data),

  updateService: (id: number, divisionId: number, nom: string) =>
    axiosInstance
      .put<ServiceResponse>(`/api/services/${id}`, {
        nom,
        divisionId,
        code: "UPDATED",
      })
      .then((res: AxiosResponse<ServiceResponse>) => res.data),

  deleteDirection: (id: number) =>
    axiosInstance.delete(`/api/directions/${id}`),
  deleteDivision: (id: number) => axiosInstance.delete(`/api/divisions/${id}`),
  deleteService: (id: number) => axiosInstance.delete(`/api/services/${id}`),
};
