// src/api/AuditApi.ts
import { axiosInstance } from "@/api/axiosInstance";
import type { DemandeHistorique } from "@/types/Audit.types";
import type { SpringPageWrapper } from "@/types/user.types";

export const auditApi = {
  getJournalAudit: (
    page: number,
    size: number,
  ): Promise<SpringPageWrapper<DemandeHistorique>> =>
    axiosInstance
      .get("/api/demandes/audit", { params: { page, size } })
      .then((r) => r.data),

  getHistoriqueDemande: (demandeId: number): Promise<DemandeHistorique[]> =>
    axiosInstance
      .get(`/api/demandes/${demandeId}/historique`)
      .then((r) => r.data),
};
