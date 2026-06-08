// src/api/AuditApi.ts
import { axiosInstance } from "@/api/axiosInstance"; // use whatever your axios file is called
import type { DemandeHistoriqueDTO } from "@/types/Audit.types";

export const auditApi = {
  getJournalAudit: (): Promise<DemandeHistoriqueDTO[]> =>
    axiosInstance.get("/api/demandes/audit").then((r) => r.data),

  getHistoriqueDemande: (demandeId: number): Promise<DemandeHistoriqueDTO[]> =>
    axiosInstance
      .get(`/api/demandes/${demandeId}/historique`)
      .then((r) => r.data),
};
