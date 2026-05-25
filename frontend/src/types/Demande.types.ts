export type TypeConge = "ANNUEL" | "MALADIE";

export type StatutDemande =
  | "BROUILLON"
  | "SOUMISE"
  | "VISEE_CHEF"
  | "SIGNEE_DIRECTEUR"
  | "REJETEE_CHEF"
  | "REJETEE_DIRECTEUR"
  | "ANNULEE";

// What we send to POST /api/demandes
export interface DemandeRequest {
  dateDebut: string; // YYYY-MM-DD
  dateFin: string; // YYYY-MM-DD
  typeConge: TypeConge;
  interimId: number;
}

// What we get back from the backend
export interface DemandeResponse {
  id: number;
  userId: number;
  userNomComplet: string;
  userServiceNom: string;
  interimId: number;
  interimNomComplet: string;
  dateDemande: string;
  dateDebut: string;
  dateFin: string;
  duree: number;
  typeConge: TypeConge;
  statut: StatutDemande;
}

// What we send for visa chef or signataire reject
export interface ProcessWorkflowRequest {
  commentaire?: string;
}
