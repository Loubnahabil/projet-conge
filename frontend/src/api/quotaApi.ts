import { axiosInstance } from "@/api/axiosInstance";
import type { SpringPageWrapper } from "@/types/user.types";

export interface QuotaResponse {
  id: number;
  userId: number;
  userNomComplet: string;
  grade: string;
  annee: number;
  joursAlloues: number;
  joursUtilises: number;
  joursRestants: number;
}

export interface QuotaRequest {
  joursAlloues: number;
  joursUtilises: number;
}

export const quotaApi = {
  // GET /api/quotas/user/{userId}/year/{annee}
  getQuotaByUserAndYear: async (userId: number, annee: number) => {
    const response = await axiosInstance.get<QuotaResponse>(
      `/api/quotas/user/${userId}/year/${annee}`,
    );
    return response.data;
  },

  // GET /api/quotas?year=2026&page=0&size=10
  getQuotasPage: async (
    year: number,
    page: number,
    size: number,
  ): Promise<SpringPageWrapper<QuotaResponse>> => {
    const response = await axiosInstance.get<SpringPageWrapper<QuotaResponse>>(
      "/api/quotas",
      { params: { year, page, size } },
    );
    return response.data;
  },

  // PUT /api/quotas/{id}
  updateQuota: async (id: number, data: QuotaRequest) => {
    const response = await axiosInstance.put<QuotaResponse>(
      `/api/quotas/${id}`,
      data,
    );
    return response.data;
  },
};
