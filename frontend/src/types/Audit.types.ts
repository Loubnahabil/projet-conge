// src/types/Audit.types.ts
export interface DemandeHistorique {
  id: number;
  demandeId: number;
  statutAction: string;
  commentaire: string | null;
  dateAction: string;
  acteurNom: string;
  acteurPrenom: string;
  acteurEmail: string;
  acteurRole: string;
}
