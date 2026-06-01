package com.example.backend.controller;

import com.example.backend.dto.request.DemandeRequestDTO;
import com.example.backend.dto.request.ProcessWorkflowRequestDTO;
import com.example.backend.dto.response.DemandeHistoriqueResponseDTO;
import com.example.backend.dto.response.DemandeResponseDTO;
import com.example.backend.dto.response.PieceJustificativeResponseDTO;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.service.DemandeHistoriqueService;
import com.example.backend.service.DemandeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


@RestController
@RequestMapping("/api/demandes")
@RequiredArgsConstructor
public class DemandeController {

    private final DemandeService demandeService;
    private final com.example.backend.repository.UserRepository userRepository;
    private final DemandeHistoriqueService historiqueService;


    @GetMapping("/my-requests")
    public ResponseEntity<List<DemandeResponseDTO>> getMyDemandes(@AuthenticationPrincipal UserDetails userDetails) {
        Long currentUserId = getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(demandeService.getUserDemandes(currentUserId));
    }

    // NEW: Handles GET /api/demandes/a-viser for supervisor profiles
    @GetMapping("/a-viser")
    public ResponseEntity<List<DemandeResponseDTO>> getDemandesAViser(@AuthenticationPrincipal UserDetails userDetails) {
        Long chefId = getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(demandeService.getDemandesAViserPourChef(chefId));
    }

    @PostMapping
    public ResponseEntity<DemandeResponseDTO> create(
            @Valid @RequestBody DemandeRequestDTO request,
            @RequestParam(defaultValue = "true") boolean submit,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long currentUserId = getAuthenticatedUserId(userDetails);
        DemandeResponseDTO response = demandeService.createDemande(currentUserId, request, submit);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/visa-chef")
    public ResponseEntity<DemandeResponseDTO> processVisaChef(
            @PathVariable Long id,
            @RequestParam boolean approve,
            @RequestBody(required = false) ProcessWorkflowRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long chefId = getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(demandeService.visaChef(chefId, id, request, approve));
    }

    @PostMapping("/{id}/upload")
    public ResponseEntity<PieceJustificativeResponseDTO> uploadAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("typeDocument") String typeDocument,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long currentUserId = getAuthenticatedUserId(userDetails);
        PieceJustificativeResponseDTO response = demandeService.uploadDocument(id, file, typeDocument, currentUserId);
        return ResponseEntity.ok(response);
    }

    private Long getAuthenticatedUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur connecté introuvable"))
                .getId();
    }

    @PutMapping("/{id}/rejet-signataire")
    public ResponseEntity<DemandeResponseDTO> rejectBySignataire(
            @PathVariable Long id,
            @RequestBody(required = false) ProcessWorkflowRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long signataireId = getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(demandeService.rejeterSignataire(signataireId, id, request));
    }

    @PutMapping("/{id}/annuler")
    public ResponseEntity<DemandeResponseDTO> annulerDemande(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long currentUserId = getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(demandeService.annulerDemande(currentUserId, id));
    }

    // NEW: Handles GET /api/demandes/a-signer for Signataire profiles
    @GetMapping("/a-signer")
    public ResponseEntity<List<DemandeResponseDTO>> getDemandesASigner(@AuthenticationPrincipal UserDetails userDetails) {
        Long signataireId = getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(demandeService.getDemandesASignerPourDirecteur(signataireId));
    }

    // Journal d'audit complet
    @GetMapping("/audit")
    public ResponseEntity<List<DemandeHistoriqueResponseDTO>> getJournalAudit() {
        return ResponseEntity.ok(historiqueService.getToutesLesActions());
    }

    // Historique d'une demande spécifique
    @GetMapping("/{id}/historique")
    public ResponseEntity<List<DemandeHistoriqueResponseDTO>> getHistoriqueDemande(@PathVariable Long id) {
        return ResponseEntity.ok(historiqueService.getHistoriquePourDemande(id));
    }

    // Toutes les demandes pour la vue admin
    @GetMapping("/all")
    public ResponseEntity<List<DemandeResponseDTO>> getAllDemandes() {
        return ResponseEntity.ok(demandeService.getAllDemandes());
    }

    @PutMapping("/{id}")
    public ResponseEntity<DemandeResponseDTO> updateDemande(
            @PathVariable Long id,
            @Valid @RequestBody DemandeRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long currentUserId = getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(demandeService.updateDemande(currentUserId, id, request));
    }
    @PutMapping("/{id}/soumettre")
    public ResponseEntity<DemandeResponseDTO> soumettreDemande(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long currentUserId = getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(demandeService.soumettreDemande(currentUserId, id));
    }

    // Demandes already treated by the chef (history tab)
    @GetMapping("/traitees-chef")
    public ResponseEntity<List<DemandeResponseDTO>> getDemandesTraiteesChef(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long chefId = getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(demandeService.getDemandesTraiteesPourChef(chefId));
    }

    // Demandes already treated by the signataire (history tab)
    @GetMapping("/traitees-signataire")
    public ResponseEntity<List<DemandeResponseDTO>> getDemandesTraiteesSignataire(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long signataireId = getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(demandeService.getDemandesTraiteesPourSignataire(signataireId));
    }

}