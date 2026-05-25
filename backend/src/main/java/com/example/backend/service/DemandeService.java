package com.example.backend.service;

import com.example.backend.dto.request.DemandeRequestDTO;
import com.example.backend.dto.request.ProcessWorkflowRequestDTO;
import com.example.backend.dto.response.DemandeResponseDTO;
import com.example.backend.dto.response.PieceJustificativeResponseDTO;
import com.example.backend.entity.*;
import com.example.backend.exception.BusinessException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.DemandeMapper;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DemandeService {

    private final DemandeRepository demandeRepository;
    private final UserRepository userRepository;
    private final QuotaRepository quotaRepository;
    private final JourFerieRepository jourFerieRepository;
    private final DemandeHistoriqueRepository historiqueRepository;
    private final PieceJustificativeRepository pieceJustificativeRepository;
    private final DocumentStorageService documentStorageService;
    private final DemandeMapper demandeMapper;

    @Transactional(readOnly = true)
    public List<DemandeResponseDTO> getUserDemandes(Long userId) {
        return demandeMapper.toDTOList(demandeRepository.findByUserId(userId));
    }

    // =========================================================================
    // 🔍 STRATIFIED HIERARCHY FETCH (For Chef Validation Dashboard)
    // =========================================================================
    @Transactional(readOnly = true)
    public List<DemandeResponseDTO> getDemandesAViserPourChef(Long chefId) {
        User chef = userRepository.findById(chefId)
                .orElseThrow(() -> new ResourceNotFoundException("Chef introuvable"));

        ServiceEntity chefService = chef.getService();
        if (chefService == null) {
            throw new BusinessException("Action refusée: Le validateur n'a pas d'affectation administrative valide.");
        }

        List<Demande> pendingDemandes;

        // Directly target the exact administrative service branch
        if (checkUserHasRole(chef, "CHEF_HIERARCHIE")) {
            pendingDemandes = demandeRepository.findByUser_Service_IdAndStatut(chefService.getId(), StatutDemande.SOUMISE);
        } else {
            // Fallback for profiles that do not have the designated supervisor authority
            return Collections.emptyList();
        }

        // Filter out self-submitted records to avoid self-validation anomalies
        List<Demande> filteredDemandes = pendingDemandes.stream()
                .filter(d -> !d.getUser().getId().equals(chefId))
                .collect(Collectors.toList());

        return demandeMapper.toDTOList(filteredDemandes);
    }

    @Transactional
    public DemandeResponseDTO createDemande(Long currentUserId, DemandeRequestDTO request, boolean submitInstantly) {
        User applicant = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        User interim = userRepository.findById(request.getInterimId())
                .orElseThrow(() -> new ResourceNotFoundException("Intérimaire introuvable"));

        // 1. Seniority Constraint: Must have at least 1 year of service
        if (applicant.getDateDebutFonction() == null || applicant.getDateDebutFonction().plusYears(1).isAfter(LocalDate.now())) {
            throw new BusinessException("Un fonctionnaire ne peut pas demander de congé avant un an d'ancienneté.");
        }

        // 2. Ensure Interim belongs to the exact same administrative service
        if (applicant.getService() == null || interim.getService() == null ||
                !applicant.getService().getId().equals(interim.getService().getId())) {
            throw new BusinessException("L'intérimaire doit obligatoirement appartenir au même service administratif.");
        }

        // 3. Interim Availability Constraint: Interim cannot be on leave during the same period
        boolean interimIsAway = demandeRepository.isInterimOnLeave(request.getInterimId(), request.getDateDebut(), request.getDateFin());
        if (interimIsAway) {
            throw new BusinessException("L'intérimaire sélectionné est lui-même en congé ou a une demande validée sur cette période.");
        }

        // 4. Date order guard clause
        if (request.getDateDebut().isAfter(request.getDateFin())) {
            throw new BusinessException("La date de début ne peut pas être postérieure à la date de fin.");
        }

        // 5. Overlapping Periods Validation Check
        boolean overlapExists = demandeRepository.hasOverlappingLeave(
                currentUserId, request.getDateDebut(), request.getDateFin()
        );
        if (overlapExists) {
            throw new BusinessException("Vous avez déjà un congé planifié ou en cours de validation sur cette période.");
        }

        // 6. Calculate Net Business Days Duration
        int businessDaysDuration = calculateBusinessDays(request.getDateDebut(), request.getDateFin());
        if (businessDaysDuration <= 0) {
            throw new BusinessException("La période sélectionnée ne contient aucun jour ouvrable.");
        }

        // 7. Manage Workflow Status Mapping & Sick Leave Enforcement
        StatutDemande initialStatus = submitInstantly ? StatutDemande.SOUMISE : StatutDemande.BROUILLON;

        // Sick Leave Constraint: If type is MALADIE, block instant submission to force a draft upload first
        if (request.getTypeConge() == TypeConge.MALADIE && submitInstantly) {
            initialStatus = StatutDemande.BROUILLON;
        }

        // 8. Quota Shield Check (Only applied to Annual Leaves)
        if (request.getTypeConge() == TypeConge.ANNUEL) {
            int targetYear = request.getDateDebut().getYear();
            Quota quota = quotaRepository.findByUserIdAndAnnee(currentUserId, targetYear)
                    .orElseThrow(() -> new BusinessException("Aucun quota annuel configuré pour l'année administrative " + targetYear));

            if (quota.getJoursRestants() < businessDaysDuration) {
                throw new BusinessException("Solde de congé insuffisant ! Jours restants disponibles: " + quota.getJoursRestants());
            }
        }

        // Build and preserve core transaction state
        Demande demande = Demande.builder()
                .user(applicant)
                .interim(interim)
                .dateDemande(LocalDate.now())
                .dateDebut(request.getDateDebut())
                .dateFin(request.getDateFin())
                .duree(businessDaysDuration)
                .typeConge(request.getTypeConge())
                .statut(initialStatus)
                .build();

        Demande savedDemande = demandeRepository.save(demande);

        // Define historical comment log string
        String logCommentaire = submitInstantly ? "Soumission initiale de la demande." : "Enregistrement en mode brouillon.";
        if (request.getTypeConge() == TypeConge.MALADIE && submitInstantly) {
            logCommentaire = "Enregistré automatiquement en mode brouillon. Un justificatif médical est obligatoire avant toute soumission.";
        }

        // Record Initial State Transition Log
        DemandeHistorique logEntry = DemandeHistorique.builder()
                .demande(savedDemande)
                .modifiePar(applicant)
                .statutAction(initialStatus)
                .commentaire(logCommentaire)
                .dateAction(LocalDateTime.now())
                .build();
        historiqueRepository.save(logEntry);

        return demandeMapper.toDTO(savedDemande);
    }

    @Transactional
    public DemandeResponseDTO visaChef(Long chefId, Long demandeId, ProcessWorkflowRequestDTO request, boolean approve) {
        Demande demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Demande introuvable"));

        if (demande.getStatut() != StatutDemande.SOUMISE) {
            throw new BusinessException("La demande n'est pas dans un état permettant la validation du chef.");
        }

        // Mandatory Rejection Comment Check
        if (!approve && (request == null || request.getCommentaire() == null || request.getCommentaire().isBlank())) {
            throw new BusinessException("Un commentaire est obligatoire en cas de rejet de la demande.");
        }

        User chef = userRepository.findById(chefId)
                .orElseThrow(() -> new ResourceNotFoundException("Chef introuvable"));

        // ENFORCE RULE 1: Verify Chef belongs to the correct administrative hierarchy path
        verifyChefHierarchy(demande.getUser(), chef);

        StatutDemande nextStatus = approve ? StatutDemande.VISEE_CHEF : StatutDemande.REJETEE_CHEF;
        demande.setStatut(nextStatus);

        // Fallback default message if approving without a custom text entry
        String finalCommentaire = (request != null && request.getCommentaire() != null && !request.getCommentaire().isBlank())
                ? request.getCommentaire()
                : (approve ? "Approuvé par le supérieur hiérarchique." : "Rejeté par le supérieur hiérarchique.");

        DemandeHistorique log = DemandeHistorique.builder()
                .demande(demande)
                .modifiePar(chef)
                .statutAction(nextStatus)
                .commentaire(finalCommentaire)
                .dateAction(LocalDateTime.now())
                .build();
        historiqueRepository.save(log);

        return demandeMapper.toDTO(demandeRepository.save(demande));
    }

    @Transactional
    public PieceJustificativeResponseDTO uploadDocument(
            Long demandeId, MultipartFile file, String typeDocument, Long currentUserId) {

        Demande demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Demande introuvable"));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        // --- AUTOMATIC TRIGGER: IF SIGNATAIRE UPLOADS DECISION_SIGNEE ---
        if ("DECISION_SIGNEE".equalsIgnoreCase(typeDocument)) {
            if (demande.getStatut() != StatutDemande.VISEE_CHEF) {
                throw new BusinessException("La demande doit être visée par le chef avant de joindre la décision signée.");
            }

            // ENFORCE RULE 2: Verify Signatory belongs to the exact same top-level Direction
            verifySignatoryDirection(demande.getUser(), currentUser);

            // Flip state machine status automatically
            demande.setStatut(StatutDemande.SIGNEE_DIRECTEUR);
        }

        // Store file onto disk partition
        String fileUrl = documentStorageService.storeFile(file);

        // Build metadata entity record
        PieceJustificative attachment = PieceJustificative.builder()
                .demande(demande)
                .nomFichier(file.getOriginalFilename())
                .urlFichier(fileUrl)
                .typeDocument(typeDocument)
                .dateUpload(LocalDateTime.now())
                .build();

        pieceJustificativeRepository.save(attachment);

        String logCommentaire = "Ajout de la pièce justificative: " + file.getOriginalFilename() + " (" + typeDocument + ")";

        if ("DECISION_SIGNEE".equalsIgnoreCase(typeDocument)) {
            logCommentaire = "Décision signée déposée par le signataire. Demande validée et clôturée automatiquement.";

            // Quota deduction mechanics
            if (demande.getTypeConge() == TypeConge.ANNUEL) {
                int targetYear = demande.getDateDebut().getYear();
                Quota quota = quotaRepository.findByUserIdAndAnnee(demande.getUser().getId(), targetYear)
                        .orElseThrow(() -> new BusinessException("Profil quota introuvable pour cette année administrative."));

                if (quota.getJoursRestants() < demande.getDuree()) {
                    throw new BusinessException("Le solde du fonctionnaire est devenu insuffisant entre-temps.");
                }

                quota.setJoursUtilises(quota.getJoursUtilises() + demande.getDuree());
                quota.setJoursRestants(quota.getJoursAlloues() - quota.getJoursUtilises());
                quotaRepository.save(quota);
            }
            demandeRepository.save(demande);
        }

        // Save modification log step
        DemandeHistorique uploadLog = DemandeHistorique.builder()
                .demande(demande)
                .modifiePar(currentUser)
                .statutAction(demande.getStatut())
                .commentaire(logCommentaire)
                .dateAction(LocalDateTime.now())
                .build();
        historiqueRepository.save(uploadLog);

        return PieceJustificativeResponseDTO.builder()
                .id(attachment.getId())
                .demandeId(demande.getId())
                .nomFichier(attachment.getNomFichier())
                .urlFichier(attachment.getUrlFichier())
                .typeDocument(attachment.getTypeDocument())
                .dateUpload(attachment.getDateUpload())
                .build();
    }

    @Transactional
    public DemandeResponseDTO rejeterSignataire(Long signataireId, Long demandeId, ProcessWorkflowRequestDTO request) {
        Demande demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Demande introuvable"));

        if (demande.getStatut() != StatutDemande.VISEE_CHEF) {
            throw new BusinessException("Seules les demandes visées par le chef peuvent être traitées par le signataire.");
        }

        // Mandatory Rejection Comment Check
        if (request == null || request.getCommentaire() == null || request.getCommentaire().isBlank()) {
            throw new BusinessException("Un commentaire est obligatoire en cas de rejet de la direction.");
        }

        User signataire = userRepository.findById(signataireId)
                .orElseThrow(() -> new ResourceNotFoundException("Signataire introuvable"));

        // ENFORCE RULE 2: Verify Signatory belongs to the exact same top-level Direction
        verifySignatoryDirection(demande.getUser(), signataire);

        // Switch status to rejected
        demande.setStatut(StatutDemande.REJETEE_DIRECTEUR);

        DemandeHistorique log = DemandeHistorique.builder()
                .demande(demande)
                .modifiePar(signataire)
                .statutAction(StatutDemande.REJETEE_DIRECTEUR)
                .commentaire(request.getCommentaire())
                .dateAction(LocalDateTime.now())
                .build();
        historiqueRepository.save(log);

        return demandeMapper.toDTO(demandeRepository.save(demande));
    }

    private int calculateBusinessDays(LocalDate start, LocalDate end) {
        Set<LocalDate> holidayDates = jourFerieRepository.findAll().stream()
                .map(JourFerie::getDate)
                .collect(Collectors.toSet());

        int count = 0;
        LocalDate current = start;
        while (!current.isAfter(end)) {
            DayOfWeek day = current.getDayOfWeek();
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY && !holidayDates.contains(current)) {
                count++;
            }
            current = current.plusDays(1);
        }
        return count;
    }

    // ==========================================
    // 🔒 PRIVATE HIERARCHY BUSINESS VALIDATIONS
    // ==========================================

    private void verifyChefHierarchy(User employee, User reviewer) {
        ServiceEntity empService = employee.getService();
        ServiceEntity revService = reviewer.getService();

        if (empService == null || revService == null) {
            throw new BusinessException("Action refusée: L'employé ou le validateur n'a pas d'affectation de service valide.");
        }

        // ✅ Updated rule: CHEF_HIERARCHIE controls requests from their exact shared Service block
        if (checkUserHasRole(reviewer, "CHEF_HIERARCHIE") && empService.getId().equals(revService.getId())) {
            return;
        }

        throw new BusinessException("Action refusée: Vous ne faites pas partie de la ligne hiérarchique de ce fonctionnaire au sein du service.");
    }

    private void verifySignatoryDirection(User employee, User signatory) {
        if (!checkUserHasRole(signatory, "SIGNATAIRE")) {
            throw new BusinessException("Action annulée: L'utilisateur exécutant cette action ne possède pas le rôle de signataire.");
        }

        Direction empDirection = getUserDirectionBranch(employee);
        Direction sigDirection = getUserDirectionBranch(signatory);

        if (empDirection == null || sigDirection == null) {
            throw new BusinessException("Action refusée: Structure de Direction introuvable pour le fonctionnaire ou le signataire.");
        }

        if (!empDirection.getId().equals(sigDirection.getId())) {
            throw new BusinessException("Action refusée: Le signataire doit impérativement appartenir à la même Direction administrative ("
                    + empDirection.getNom() + ") que le fonctionnaire.");
        }
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

    @Transactional
    public DemandeResponseDTO annulerDemande(Long userId, Long demandeId) {
        Demande demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Demande introuvable"));

        if (!demande.getUser().getId().equals(userId)) {
            throw new BusinessException("Action refusée: Vous ne pouvez annuler que vos propres demandes.");
        }

        if (demande.getStatut() != StatutDemande.BROUILLON && demande.getStatut() != StatutDemande.SOUMISE) {
            throw new BusinessException("Impossible d'annuler une demande déjà traitée ou validée.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        demande.setStatut(StatutDemande.ANNULEE);

        DemandeHistorique log = DemandeHistorique.builder()
                .demande(demande)
                .modifiePar(user)
                .statutAction(StatutDemande.ANNULEE)
                .commentaire("Demande annulée par le fonctionnaire.")
                .dateAction(LocalDateTime.now())
                .build();
        historiqueRepository.save(log);

        return demandeMapper.toDTO(demandeRepository.save(demande));
    }
}