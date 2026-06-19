import { axiosInstance } from "@/api/axiosInstance";
import type { DirectionResponse, DivisionResponse, ServiceResponse } from "@/types/structure.types";
import type { AxiosResponse } from "axios";

export const structureApi = {
  getDirections: () =>
    axiosInstance
      .get<DirectionResponse[]>("/directions")
      .then((res: AxiosResponse<DirectionResponse[]>) => res.data),

  getDivisions: () =>
    axiosInstance
      .get<DivisionResponse[]>("/divisions")
      .then((res: AxiosResponse<DivisionResponse[]>) => res.data),

  getServices: () =>
    axiosInstance
      .get<ServiceResponse[]>("/services")
      .then((res: AxiosResponse<ServiceResponse[]>) => res.data),

  getDivisionsByDirection: (directionId: number) =>
    axiosInstance
      .get<DivisionResponse[]>(`/divisions/by-direction/${directionId}`)
      .then((res: AxiosResponse<DivisionResponse[]>) => res.data),

  getServicesByDivision: (divisionId: number) =>
    axiosInstance
      .get<ServiceResponse[]>(`/services/by-division/${divisionId}`)
      .then((res: AxiosResponse<ServiceResponse[]>) => res.data),

  createDirection: (nom: string) =>
    axiosInstance
      .post<DirectionResponse>("/directions", {
        nom,
        code: nom.substring(0, 3).toUpperCase(),
      })
      .then((res: AxiosResponse<DirectionResponse>) => res.data),

  createDivision: (directionId: number, nom: string) =>
    axiosInstance
      .post<DivisionResponse>("/divisions", {
        nom,
        directionId,
        code: nom.substring(0, 3).toUpperCase(),
      })
      .then((res: AxiosResponse<DivisionResponse>) => res.data),

  createService: (divisionId: number, nom: string) =>
    axiosInstance
      .post<ServiceResponse>("/services", {
        nom,
        divisionId,
        code: nom.substring(0, 3).toUpperCase(),
      })
      .then((res: AxiosResponse<ServiceResponse>) => res.data),

  updateDirection: (id: number, nom: string) =>
    axiosInstance
      .put<DirectionResponse>(`/directions/${id}`, {
        nom,
        code: "UPDATED",
      })
      .then((res: AxiosResponse<DirectionResponse>) => res.data),

  updateDivision: (id: number, directionId: number, nom: string) =>
    axiosInstance
      .put<DivisionResponse>(`/divisions/${id}`, {
        nom,
        directionId,
        code: "UPDATED",
      })
      .then((res: AxiosResponse<DivisionResponse>) => res.data),

  updateService: (id: number, divisionId: number, nom: string) =>
    axiosInstance
      .put<ServiceResponse>(`/services/${id}`, {
        nom,
        divisionId,
        code: "UPDATED",
      })
      .then((res: AxiosResponse<ServiceResponse>) => res.data),

  deleteDirection: (id: number) => axiosInstance.delete(`/directions/${id}`),
  deleteDivision: (id: number) => axiosInstance.delete(`/divisions/${id}`),
  deleteService: (id: number) => axiosInstance.delete(`/services/${id}`),
};
