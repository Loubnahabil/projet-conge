import { axiosInstance } from "./axiosInstance";

export interface QuotaResponseDTO {
  id: number;
  userId: number;
  userNomComplet: string;
  annee: number;
  joursAlloues: number;
  joursUtilises: number;
  joursRestants: number;
}

export interface QuotaRequestDTO {
  joursAlloues: number;
  joursUtilises: number;
}

export const quotaApi = {
  // GET /api/quotas/user/{userId}/year/{annee}
  getQuotaByUserAndYear: async (userId: number, annee: number) => {
    const response = await axiosInstance.get<QuotaResponseDTO>(
      `/api/quotas/user/${userId}/year/${annee}`,
    );
    return response.data;
  },

  // PUT /api/quotas/{id}
  updateQuota: async (id: number, data: QuotaRequestDTO) => {
    const response = await axiosInstance.put<QuotaResponseDTO>(
      `/api/quotas/${id}`,
      data,
    );
    return response.data;
  },
};
