package com.example.backend.service;

import com.example.backend.entity.Demande;
import com.example.backend.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    @SuppressWarnings("SpringJavaInjectionPointsAutowiringInspection")
    private final JavaMailSender mailSender;

    // =========================================================================
    // TRIGGER 1 — createDemande → SOUMISE
    // Recipient: Chef hiérarchique du fonctionnaire
    // =========================================================================
    @Async
    public void sendDemandeSubmittedToChef(Demande demande, User chef) {
        String subject = String.format("[Congés] Nouvelle demande à viser — %s %s",
                demande.getUser().getNom(), demande.getUser().getPrenom());

        String body = String.format("""
                Bonjour %s %s,

                Une nouvelle demande de congé vient d'être soumise et nécessite votre visa.

                ─── Détails du dossier ───────────────────────────
                Fonctionnaire : %s %s
                Type de congé : %s
                Date de départ : %s
                Date de retour : %s
                Durée          : %d jour(s) ouvrable(s)
                ──────────────────────────────────────────────────

                Veuillez vous connecter à l'application pour traiter cette demande.

                Cordialement,
                Système de Gestion des Congés
                """,
                chef.getPrenom(), chef.getNom(),
                demande.getUser().getPrenom(), demande.getUser().getNom(),
                formatTypeConge(demande.getTypeConge().name()),
                demande.getDateDebut(),
                demande.getDateFin(),
                demande.getDuree()
        );

        send(chef.getEmail(), subject, body);
    }

    // =========================================================================
    // TRIGGER 2a — visaChef approve → VISEE_CHEF
    // Recipient: Fonctionnaire (his request was approved by chef)
    // =========================================================================
    @Async
    public void sendVisaChefApprovedToFonctionnaire(Demande demande) {
        String subject = String.format("[Congés] Votre demande a été visée — DEM-2026-00%d", demande.getId());

        String body = String.format("""
                Bonjour %s %s,

                Bonne nouvelle ! Votre demande de congé a été visée par votre chef hiérarchique
                et est transmise au signataire pour signature finale.

                ─── Détails du dossier ───────────────────────────
                Référence      : DEM-2026-00%d
                Type de congé  : %s
                Date de départ : %s
                Date de retour : %s
                Durée          : %d jour(s) ouvrable(s)
                Statut actuel  : Visée — en attente de signature
                ──────────────────────────────────────────────────

                Vous pouvez suivre l'état de votre dossier depuis votre espace personnel.

                Cordialement,
                Système de Gestion des Congés
                """,
                demande.getUser().getPrenom(), demande.getUser().getNom(),
                demande.getId(),
                formatTypeConge(demande.getTypeConge().name()),
                demande.getDateDebut(),
                demande.getDateFin(),
                demande.getDuree()
        );

        send(demande.getUser().getEmail(), subject, body);
    }

    // =========================================================================
    // TRIGGER 2b — visaChef approve → VISEE_CHEF
    // Recipient: Signataire (new dossier waiting for his signature)
    // =========================================================================
    @Async
    public void sendVisaChefApprovedToSignataire(Demande demande, User signataire) {
        String subject = String.format("[Congés] Dossier à signer — %s %s",
                demande.getUser().getNom(), demande.getUser().getPrenom());

        String body = String.format("""
                Bonjour %s %s,

                Un dossier de congé visé par le chef hiérarchique est en attente de votre signature.

                ─── Détails du dossier ───────────────────────────
                Référence      : DEM-2026-00%d
                Fonctionnaire  : %s %s
                Type de congé  : %s
                Date de départ : %s
                Date de retour : %s
                Durée          : %d jour(s) ouvrable(s)
                ──────────────────────────────────────────────────

                Veuillez vous connecter à l'application pour déposer la décision signée.

                Cordialement,
                Système de Gestion des Congés
                """,
                signataire.getPrenom(), signataire.getNom(),
                demande.getId(),
                demande.getUser().getPrenom(), demande.getUser().getNom(),
                formatTypeConge(demande.getTypeConge().name()),
                demande.getDateDebut(),
                demande.getDateFin(),
                demande.getDuree()
        );

        send(signataire.getEmail(), subject, body);
    }

    // =========================================================================
    // TRIGGER 3 — visaChef reject → REJETEE_CHEF
    // Recipient: Fonctionnaire
    // =========================================================================
    @Async
    public void sendVisaChefRejectedToFonctionnaire(Demande demande, String motif) {
        String subject = String.format("[Congés] Votre demande a été rejetée — DEM-2026-00%d", demande.getId());

        String body = String.format("""
                Bonjour %s %s,

                Votre demande de congé a été rejetée par votre chef hiérarchique.

                ─── Détails du dossier ───────────────────────────
                Référence      : DEM-2026-00%d
                Type de congé  : %s
                Date de départ : %s
                Date de retour : %s
                Motif du rejet : %s
                ──────────────────────────────────────────────────

                Vous pouvez soumettre une nouvelle demande depuis votre espace personnel.

                Cordialement,
                Système de Gestion des Congés
                """,
                demande.getUser().getPrenom(), demande.getUser().getNom(),
                demande.getId(),
                formatTypeConge(demande.getTypeConge().name()),
                demande.getDateDebut(),
                demande.getDateFin(),
                motif != null ? motif : "Aucun motif précisé"
        );

        send(demande.getUser().getEmail(), subject, body);
    }

    // =========================================================================
    // TRIGGER 4 — uploadDocument DECISION_SIGNEE → SIGNEE_DIRECTEUR
    // Recipient: Fonctionnaire
    // =========================================================================
    @Async
    public void sendSignedToFonctionnaire(Demande demande) {
        String subject = String.format("[Congés] Votre congé est accordé — DEM-2026-00%d", demande.getId());

        String body = String.format("""
                Bonjour %s %s,

                Votre demande de congé a été signée par le directeur. Votre congé est officiellement accordé.

                ─── Détails du dossier ───────────────────────────
                Référence      : DEM-2026-00%d
                Type de congé  : %s
                Date de départ : %s
                Date de retour : %s
                Durée accordée : %d jour(s) ouvrable(s)
                Statut final   : ✅ Signé — Congé accordé
                ──────────────────────────────────────────────────

                La décision signée est disponible dans votre dossier.

                Cordialement,
                Système de Gestion des Congés
                """,
                demande.getUser().getPrenom(), demande.getUser().getNom(),
                demande.getId(),
                formatTypeConge(demande.getTypeConge().name()),
                demande.getDateDebut(),
                demande.getDateFin(),
                demande.getDuree()
        );

        send(demande.getUser().getEmail(), subject, body);
    }

    // =========================================================================
    // TRIGGER 5 — rejeterSignataire → REJETEE_DIRECTEUR
    // Recipient: Fonctionnaire
    // =========================================================================
    @Async
    public void sendSignataireRejectedToFonctionnaire(Demande demande, String motif) {
        String subject = String.format("[Congés] Votre demande a été rejetée par la direction — DEM-2026-00%d", demande.getId());

        String body = String.format("""
                Bonjour %s %s,

                Votre demande de congé a été rejetée par le signataire de la direction.

                ─── Détails du dossier ───────────────────────────
                Référence      : DEM-2026-00%d
                Type de congé  : %s
                Date de départ : %s
                Date de retour : %s
                Motif du rejet : %s
                ──────────────────────────────────────────────────

                Vous pouvez soumettre une nouvelle demande depuis votre espace personnel.

                Cordialement,
                Système de Gestion des Congés
                """,
                demande.getUser().getPrenom(), demande.getUser().getNom(),
                demande.getId(),
                formatTypeConge(demande.getTypeConge().name()),
                demande.getDateDebut(),
                demande.getDateFin(),
                motif != null ? motif : "Aucun motif précisé"
        );

        send(demande.getUser().getEmail(), subject, body);
    }


    // =========================================================================
// TRIGGER 6 — Rappel chef : demande SOUMISE, dateDebut dans 3 jours
// Recipient: Chef hiérarchique
// =========================================================================
    @Async
    public void sendRappelChef(Demande demande, User chef) {
        String subject = String.format("[Congés] ⚠️ Rappel — Demande en attente de visa — %s %s",
                demande.getUser().getNom(), demande.getUser().getPrenom());

        String body = String.format("""
            Bonjour %s %s,

            ⚠️ RAPPEL URGENT — Une demande de congé attend toujours votre visa
            alors que la date de départ est dans 3 jours.

            ─── Détails du dossier ───────────────────────────
            Fonctionnaire  : %s %s
            Type de congé  : %s
            Date de départ : %s
            Date de retour : %s
            Durée          : %d jour(s) ouvrable(s)
            Statut actuel  : En attente de visa chef
            ──────────────────────────────────────────────────

            Veuillez traiter cette demande dans les plus brefs délais.

            Cordialement,
            Système de Gestion des Congés
            """,
                chef.getPrenom(), chef.getNom(),
                demande.getUser().getPrenom(), demande.getUser().getNom(),
                formatTypeConge(demande.getTypeConge().name()),
                demande.getDateDebut(),
                demande.getDateFin(),
                demande.getDuree()
        );

        send(chef.getEmail(), subject, body);
    }

    // =========================================================================
// TRIGGER 7 — Rappel signataire : demande VISEE_CHEF, dateDebut dans 3 jours
// Recipient: Signataire
// =========================================================================
    @Async
    public void sendRappelSignataire(Demande demande, User signataire) {
        String subject = String.format("[Congés] ⚠️ Rappel — Dossier en attente de signature — %s %s",
                demande.getUser().getNom(), demande.getUser().getPrenom());

        String body = String.format("""
            Bonjour %s %s,

            ⚠️ RAPPEL URGENT — Un dossier visé par le chef attend toujours
            votre signature alors que la date de départ est dans 3 jours.

            ─── Détails du dossier ───────────────────────────
            Référence      : DEM-2026-00%d
            Fonctionnaire  : %s %s
            Type de congé  : %s
            Date de départ : %s
            Date de retour : %s
            Durée          : %d jour(s) ouvrable(s)
            Statut actuel  : Visée chef — en attente de signature
            ──────────────────────────────────────────────────

            Veuillez déposer la décision signée dans les plus brefs délais.

            Cordialement,
            Système de Gestion des Congés
            """,
                signataire.getPrenom(), signataire.getNom(),
                demande.getId(),
                demande.getUser().getPrenom(), demande.getUser().getNom(),
                formatTypeConge(demande.getTypeConge().name()),
                demande.getDateDebut(),
                demande.getDateFin(),
                demande.getDuree()
        );

        send(signataire.getEmail(), subject, body);
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@gestion-conges.ma");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email envoyé à {} — Sujet: {}", to, subject);
        } catch (MailException e) {
            // Never block the main workflow if email fails
            log.error("Échec d'envoi email à {} — {}", to, e.getMessage());
        }
    }

    private String formatTypeConge(String type) {
        return switch (type) {
            case "ANNUEL" -> "Congé Annuel";
            case "MALADIE" -> "Congé Maladie";
            default -> type;
        };
    }
}