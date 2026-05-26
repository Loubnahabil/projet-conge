package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStatsResponseDTO {

    // ── Totals ────────────────────────────────────────────────────────────────
    private long totalDemandes;
    private long totalFonctionnaires;

    // ── Par statut ────────────────────────────────────────────────────────────
    private Map<String, Long> parStatut;

    // ── Par type de congé ─────────────────────────────────────────────────────
    private Map<String, Long> parTypeConge;

    // ── Taux validation / rejet ───────────────────────────────────────────────
    private double tauxValidation;   // % of SIGNEE_DIRECTEUR out of terminal states
    private double tauxRejet;        // % of REJETEE_* out of terminal states

    // ── Par direction ─────────────────────────────────────────────────────────
    private List<DirectionStatDTO> parDirection;

    // ── Statistiques mensuelles (current year) ────────────────────────────────
    private List<MoisStatDTO> parMois;

    // ── En cours de traitement ────────────────────────────────────────────────
    private long enAttenteVisa;       // SOUMISE
    private long enAttenteSignature;  // VISEE_CHEF

    // ─────────────────────────────────────────────────────────────────────────
    // Nested DTOs
    // ─────────────────────────────────────────────────────────────────────────

    @Data
    @Builder
    public static class DirectionStatDTO {
        private String directionNom;
        private long nombreDemandes;
    }

    @Data
    @Builder
    public static class MoisStatDTO {
        private int mois;           // 1-12
        private String moisLabel;  // "Jan", "Fév", ...
        private long nombreDemandes;
    }
}