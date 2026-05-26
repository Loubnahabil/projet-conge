package com.example.backend.service;

import com.example.backend.dto.response.DashboardStatsResponseDTO;
import com.example.backend.dto.response.DashboardStatsResponseDTO.DirectionStatDTO;
import com.example.backend.dto.response.DashboardStatsResponseDTO.MoisStatDTO;
import com.example.backend.entity.StatutDemande;
import com.example.backend.repository.DemandeRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatistiquesService {

    private final DemandeRepository demandeRepository;
    private final UserRepository userRepository;

    private static final String[] MOIS_LABELS = {
            "", "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
            "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"
    };

    @Transactional(readOnly = true)
    public DashboardStatsResponseDTO getDashboardStats() {

        // ── Totals ────────────────────────────────────────────────────────────
        long totalDemandes = demandeRepository.count();
        long totalFonctionnaires = userRepository.count();

        // ── Par statut ────────────────────────────────────────────────────────
        Map<String, Long> parStatut = new LinkedHashMap<>();
        for (Object[] row : demandeRepository.countByStatut()) {
            parStatut.put(row[0].toString(), (Long) row[1]);
        }

        // ── Par type de congé ─────────────────────────────────────────────────
        Map<String, Long> parTypeConge = new LinkedHashMap<>();
        for (Object[] row : demandeRepository.countByTypeConge()) {
            parTypeConge.put(row[0].toString(), (Long) row[1]);
        }

        // ── Taux validation / rejet ───────────────────────────────────────────
        long signees  = parStatut.getOrDefault("SIGNEE_DIRECTEUR", 0L);
        long rejetees = parStatut.getOrDefault("REJETEE_CHEF", 0L)
                + parStatut.getOrDefault("REJETEE_DIRECTEUR", 0L);
        long terminal = signees + rejetees;

        double tauxValidation = terminal > 0 ? Math.round((signees  * 100.0 / terminal) * 10) / 10.0 : 0.0;
        double tauxRejet      = terminal > 0 ? Math.round((rejetees * 100.0 / terminal) * 10) / 10.0 : 0.0;

        // ── En cours de traitement ────────────────────────────────────────────
        long enAttenteVisa      = demandeRepository.countByStatut(StatutDemande.SOUMISE);
        long enAttenteSignature = demandeRepository.countByStatut(StatutDemande.VISEE_CHEF);

        // ── Par direction ─────────────────────────────────────────────────────
        List<DirectionStatDTO> parDirection = new ArrayList<>();
        for (Object[] row : demandeRepository.countByDirection()) {
            parDirection.add(DirectionStatDTO.builder()
                    .directionNom(row[0] != null ? row[0].toString() : "Non assigné")
                    .nombreDemandes((Long) row[1])
                    .build());
        }

        // ── Statistiques mensuelles (année en cours) ──────────────────────────
        int anneeEnCours = LocalDate.now().getYear();
        Map<Integer, Long> rawMois = new LinkedHashMap<>();
        for (Object[] row : demandeRepository.countByMoisForAnnee(anneeEnCours)) {
            rawMois.put(((Number) row[0]).intValue(), (Long) row[1]);
        }

        // Ensure all 12 months present even if zero demandes
        List<MoisStatDTO> parMois = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            parMois.add(MoisStatDTO.builder()
                    .mois(m)
                    .moisLabel(MOIS_LABELS[m])
                    .nombreDemandes(rawMois.getOrDefault(m, 0L))
                    .build());
        }

        return DashboardStatsResponseDTO.builder()
                .totalDemandes(totalDemandes)
                .totalFonctionnaires(totalFonctionnaires)
                .parStatut(parStatut)
                .parTypeConge(parTypeConge)
                .tauxValidation(tauxValidation)
                .tauxRejet(tauxRejet)
                .enAttenteVisa(enAttenteVisa)
                .enAttenteSignature(enAttenteSignature)
                .parDirection(parDirection)
                .parMois(parMois)
                .build();
    }
}