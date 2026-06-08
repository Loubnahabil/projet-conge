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

export interface FonctionnaireDashboardStats {
  quotaAlloue: number;
  quotaUtilise: number;
  quotaRestant: number;
  totalDemandes: number;
  enAttenteVisa: number;
  approuvees: number;
  rejetees: number;
  demandesRecentes: DemandeResponse[];
}

export interface ChefDashboardStats {
  enAttenteVisa: number;
  totalTraitees: number;
  approuvees: number;
  rejetees: number;
  demandesRecentes: DemandeResponse[];
}

export interface SignataireDashboardStats {
  enAttenteSignature: number;
  totalTraitees: number;
  signees: number;
  rejetees: number;
  demandesRecentes: DemandeResponse[];
}

import type { DemandeResponse } from "./Demande.types";
