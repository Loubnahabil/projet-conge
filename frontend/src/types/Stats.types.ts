// src/types/stats.types.ts

export interface DirectionStatDTO {
  directionNom: string;
  nombreDemandes: number;
}

export interface MoisStatDTO {
  mois: number;
  moisLabel: string;
  nombreDemandes: number;
}

export interface DashboardStatsResponse {
  totalDemandes: number;
  totalFonctionnaires: number;

  parStatut: Record<string, number>;
  parTypeConge: Record<string, number>;

  tauxValidation: number;
  tauxRejet: number;

  enAttenteVisa: number;
  enAttenteSignature: number;

  parDirection: DirectionStatDTO[];
  parMois: MoisStatDTO[];
}
