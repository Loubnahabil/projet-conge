import { axiosInstance } from "@/api/axiosInstance";
import type { JourFerieResponse } from "@/types/jourFerie.types";
import type { AxiosResponse } from "axios";

export const jourFerieApi = {
  getAll: () =>
    axiosInstance
      .get<JourFerieResponse[]>("/jours-feries")
      .then((res: AxiosResponse<JourFerieResponse[]>) => res.data),

  getById: (id: number) =>
    axiosInstance
      .get<JourFerieResponse>(`/jours-feries/${id}`)
      .then((res: AxiosResponse<JourFerieResponse>) => res.data),

  create: (date: string, libelle: string) =>
    axiosInstance
      .post<JourFerieResponse>("/jours-feries", { date, libelle })
      .then((res: AxiosResponse<JourFerieResponse>) => res.data),

  update: (id: number, date: string, libelle: string) =>
    axiosInstance
      .put<JourFerieResponse>(`/jours-feries/${id}`, { date, libelle })
      .then((res: AxiosResponse<JourFerieResponse>) => res.data),

  delete: (id: number) => axiosInstance.delete(`/jours-feries/${id}`),
};
