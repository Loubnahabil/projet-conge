package com.example.backend.service;

import com.example.backend.entity.*;
import com.example.backend.repository.DemandeRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class RappelScheduler {

    private final DemandeRepository demandeRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // Runs every day at 8:00 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void envoyerRappels() {
        LocalDate dateSeuil = LocalDate.now().plusDays(3);
        log.info("[Scheduler] Vérification des rappels pour dateDebut = {}", dateSeuil);

        // ── Rappel chef: demandes still SOUMISE with dateDebut in 3 days ──
        List<Demande> demandesAViser = demandeRepository
                .findByDateDebutAndStatut(dateSeuil, StatutDemande.SOUMISE);

        for (Demande demande : demandesAViser) {
            findChefDuService(demande.getUser()).ifPresentOrElse(
                    chef -> {
                        emailService.sendRappelChef(demande, chef);
                        log.info("[Scheduler] Rappel chef envoyé → {} pour demande {}",
                                chef.getEmail(), demande.getId());
                    },
                    () -> log.warn("[Scheduler] Aucun chef trouvé pour demande {}", demande.getId())
            );
        }

        // ── Rappel signataire: demandes still VISEE_CHEF with dateDebut in 3 days ──
        List<Demande> demandesASigner = demandeRepository
                .findByDateDebutAndStatut(dateSeuil, StatutDemande.VISEE_CHEF);

        for (Demande demande : demandesASigner) {
            findSignataireDeLaDirection(demande.getUser()).ifPresentOrElse(
                    signataire -> {
                        emailService.sendRappelSignataire(demande, signataire);
                        log.info("[Scheduler] Rappel signataire envoyé → {} pour demande {}",
                                signataire.getEmail(), demande.getId());
                    },
                    () -> log.warn("[Scheduler] Aucun signataire trouvé pour demande {}", demande.getId())
            );
        }

        log.info("[Scheduler] Rappels terminés — {} SOUMISE, {} VISEE_CHEF traités",
                demandesAViser.size(), demandesASigner.size());
    }

    // ── Same helper logic as in DemandeService ──────────────────────────────

    private Optional<User> findChefDuService(User applicant) {
        if (applicant.getService() == null) return Optional.empty();
        return userRepository.findByService_Id(applicant.getService().getId())
                .stream()
                .filter(u -> !u.getId().equals(applicant.getId()))
                .filter(u -> checkUserHasRole(u, "CHEF_HIERARCHIE"))
                .filter(u -> Boolean.TRUE.equals(u.getEnabled()))
                .findFirst();
    }

    private Optional<User> findSignataireDeLaDirection(User fonctionnaire) {
        Direction dir = getUserDirectionBranch(fonctionnaire);
        if (dir == null) return Optional.empty();
        return userRepository.findAll()
                .stream()
                .filter(u -> checkUserHasRole(u, "SIGNATAIRE"))
                .filter(u -> Boolean.TRUE.equals(u.getEnabled()))
                .filter(u -> {
                    Direction uDir = getUserDirectionBranch(u);
                    return uDir != null && uDir.getId().equals(dir.getId());
                })
                .findFirst();
    }

    private Direction getUserDirectionBranch(User user) {
        if (user.getService() != null && user.getService().getDivision() != null) {
            return user.getService().getDivision().getDirection();
        }
        return null;
    }

    private boolean checkUserHasRole(User user, String targetRole) {
        if (user.getRoles() == null) return false;
        return user.getRoles().stream()
                .anyMatch(role -> role.getName().equalsIgnoreCase(targetRole) ||
                        role.getName().equalsIgnoreCase("ROLE_" + targetRole));
    }
}