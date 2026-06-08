package com.example.backend.service;

import com.example.backend.dto.response.ChefDashboardResponseDTO;
import com.example.backend.dto.response.DashboardStatsResponseDTO;
import com.example.backend.dto.response.DashboardStatsResponseDTO.DirectionStatDTO;
import com.example.backend.dto.response.DashboardStatsResponseDTO.MoisStatDTO;
import com.example.backend.dto.response.FonctionnaireDashboardResponseDTO;
import com.example.backend.dto.response.SignataireDashboardResponseDTO;
import com.example.backend.entity.Quota;
import com.example.backend.entity.StatutDemande;
import com.example.backend.entity.User;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.DemandeMapper;
import com.example.backend.repository.DemandeRepository;
import com.example.backend.repository.QuotaRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatistiquesService {

    private final DemandeRepository demandeRepository;
    private final UserRepository userRepository;
    private final QuotaRepository quotaRepository;
    private final DemandeMapper demandeMapper;

    private static final String[] MOIS_LABELS = {
            "", "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
            "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"
    };

    @Transactional(readOnly = true)
    public DashboardStatsResponseDTO getDashboardStats() {

        long totalDemandes = demandeRepository.count();
        long totalFonctionnaires = userRepository.count();

        Map<String, Long> parStatut = new LinkedHashMap<>();
        for (Object[] row : demandeRepository.countByStatut()) {
            parStatut.put(row[0].toString(), (Long) row[1]);
        }

        Map<String, Long> parTypeConge = new LinkedHashMap<>();
        for (Object[] row : demandeRepository.countByTypeConge()) {
            parTypeConge.put(row[0].toString(), (Long) row[1]);
        }

        long signees  = parStatut.getOrDefault("SIGNEE_DIRECTEUR", 0L);
        long rejetees = parStatut.getOrDefault("REJETEE_CHEF", 0L)
                + parStatut.getOrDefault("REJETEE_DIRECTEUR", 0L);
        long terminal = signees + rejetees;

        double tauxValidation = terminal > 0 ? Math.round((signees  * 100.0 / terminal) * 10) / 10.0 : 0.0;
        double tauxRejet      = terminal > 0 ? Math.round((rejetees * 100.0 / terminal) * 10) / 10.0 : 0.0;

        long enAttenteVisa      = demandeRepository.countByStatut(StatutDemande.SOUMISE);
        long enAttenteSignature = demandeRepository.countByStatut(StatutDemande.VISEE_CHEF);

        List<DirectionStatDTO> parDirection = new ArrayList<>();
        for (Object[] row : demandeRepository.countByDirection()) {
            parDirection.add(DirectionStatDTO.builder()
                    .directionNom(row[0] != null ? row[0].toString() : "Non assigné")
                    .nombreDemandes((Long) row[1])
                    .build());
        }

        int anneeEnCours = LocalDate.now().getYear();
        Map<Integer, Long> rawMois = new LinkedHashMap<>();
        for (Object[] row : demandeRepository.countByMoisForAnnee(anneeEnCours)) {
            rawMois.put(((Number) row[0]).intValue(), (Long) row[1]);
        }

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

    @Transactional(readOnly = true)
    public FonctionnaireDashboardResponseDTO getFonctionnaireDashboard(Long userId) {
        int currentYear = LocalDate.now().getYear();
        Quota quota = quotaRepository.findByUserIdAndAnnee(userId, currentYear)
                .orElse(Quota.builder().joursAlloues(0).joursUtilises(0).joursRestants(0).build());

        long totalDemandes = demandeRepository.findByUserId(userId).size();
        long enAttenteVisa = demandeRepository.countByUserIdAndStatut(userId, StatutDemande.SOUMISE);
        long approuvees = demandeRepository.countByUserIdAndStatut(userId, StatutDemande.SIGNEE_DIRECTEUR);
        long rejetees = demandeRepository.countByUserIdAndStatutIn(userId,
                Arrays.asList(StatutDemande.REJETEE_CHEF, StatutDemande.REJETEE_DIRECTEUR));

        List<com.example.backend.entity.Demande> recent = demandeRepository.findTop5ByUserIdOrderByDateDemandeDesc(userId);

        return FonctionnaireDashboardResponseDTO.builder()
                .quotaAlloue(quota.getJoursAlloues())
                .quotaUtilise(quota.getJoursUtilises())
                .quotaRestant(quota.getJoursRestants())
                .totalDemandes(totalDemandes)
                .enAttenteVisa(enAttenteVisa)
                .approuvees(approuvees)
                .rejetees(rejetees)
                .demandesRecentes(demandeMapper.toDTOList(recent))
                .build();
    }

    @Transactional(readOnly = true)
    public ChefDashboardResponseDTO getChefDashboard(Long chefId) {
        User chef = userRepository.findById(chefId)
                .orElseThrow(() -> new ResourceNotFoundException("Chef introuvable"));

        long enAttenteVisa = demandeRepository.findByUser_Service_IdAndStatut(
                chef.getService().getId(), StatutDemande.SOUMISE)
                .stream().filter(d -> !d.getUser().getId().equals(chefId)).count();

        long approuvees = demandeRepository.countByChefIdAndStatut(chefId, StatutDemande.VISEE_CHEF);
        long rejetees = demandeRepository.countByChefIdAndStatut(chefId, StatutDemande.REJETEE_CHEF);
        long totalTraitees = approuvees + rejetees;

        List<com.example.backend.entity.Demande> recent = demandeRepository.findTop5RecentByChefId(chefId);

        return ChefDashboardResponseDTO.builder()
                .enAttenteVisa(enAttenteVisa)
                .totalTraitees(totalTraitees)
                .approuvees(approuvees)
                .rejetees(rejetees)
                .demandesRecentes(demandeMapper.toDTOList(recent))
                .build();
    }

    @Transactional(readOnly = true)
    public SignataireDashboardResponseDTO getSignataireDashboard(Long signataireId) {
        User signataire = userRepository.findById(signataireId)
                .orElseThrow(() -> new ResourceNotFoundException("Signataire introuvable"));

        com.example.backend.entity.Direction sigDirection = null;
        if (signataire.getService() != null && signataire.getService().getDivision() != null) {
            sigDirection = signataire.getService().getDivision().getDirection();
        }

        long enAttenteSignature = 0;
        if (sigDirection != null) {
            enAttenteSignature = demandeRepository.findByDirectionIdAndStatut(
                    sigDirection.getId(), StatutDemande.VISEE_CHEF).size();
        }

        long signees = demandeRepository.countByChefIdAndStatut(signataireId, StatutDemande.SIGNEE_DIRECTEUR);
        long rejetees = demandeRepository.countByChefIdAndStatut(signataireId, StatutDemande.REJETEE_DIRECTEUR);
        long totalTraitees = signees + rejetees;

        List<com.example.backend.entity.Demande> recent = demandeRepository.findTop5RecentBySignataireId(signataireId);

        return SignataireDashboardResponseDTO.builder()
                .enAttenteSignature(enAttenteSignature)
                .totalTraitees(totalTraitees)
                .signees(signees)
                .rejetees(rejetees)
                .demandesRecentes(demandeMapper.toDTOList(recent))
                .build();
    }
}
