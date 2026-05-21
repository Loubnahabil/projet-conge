import { axiosInstance } from "./axiosInstance";
import type { JourFerieResponseDTO } from "../types/jourFerie.types";
import type { AxiosResponse } from "axios";

export const jourFerieApi = {
  getAll: () =>
    axiosInstance
      .get<JourFerieResponseDTO[]>("/api/jours-feries")
      .then((res: AxiosResponse<JourFerieResponseDTO[]>) => res.data),

  getById: (id: number) =>
    axiosInstance
      .get<JourFerieResponseDTO>(`/api/jours-feries/${id}`)
      .then((res: AxiosResponse<JourFerieResponseDTO>) => res.data),

  create: (date: string, libelle: string) =>
    axiosInstance
      .post<JourFerieResponseDTO>("/api/jours-feries", { date, libelle })
      .then((res: AxiosResponse<JourFerieResponseDTO>) => res.data),

  update: (id: number, date: string, libelle: string) =>
    axiosInstance
      .put<JourFerieResponseDTO>(`/api/jours-feries/${id}`, { date, libelle })
      .then((res: AxiosResponse<JourFerieResponseDTO>) => res.data),

  delete: (id: number) => axiosInstance.delete(`/api/jours-feries/${id}`),
};
