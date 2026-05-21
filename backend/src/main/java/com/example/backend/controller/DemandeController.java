package com.example.backend.controller;

import com.example.backend.dto.request.DemandeRequestDTO;
import com.example.backend.dto.request.ProcessWorkflowRequestDTO;
import com.example.backend.dto.response.DemandeResponseDTO;
import com.example.backend.dto.response.PieceJustificativeResponseDTO;
import com.example.backend.exception.ResourceNotFoundException;
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

    @GetMapping("/my-requests")
    public ResponseEntity<List<DemandeResponseDTO>> getMyDemandes(@AuthenticationPrincipal UserDetails userDetails) {
        Long currentUserId = getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(demandeService.getUserDemandes(currentUserId));
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
    //@PreAuthorize("hasAuthority('CHEF_HIERARCHIE')")
    public ResponseEntity<DemandeResponseDTO> processVisaChef(
            @PathVariable Long id,
            @RequestParam boolean approve,
            @RequestBody(required = false) ProcessWorkflowRequestDTO request, // Optional payload structure
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
    //@PreAuthorize("hasAuthority('SIGNATAIRE')")
    public ResponseEntity<DemandeResponseDTO> rejectBySignataire(
            @PathVariable Long id,
            @RequestBody(required = false) ProcessWorkflowRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long signataireId = getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(demandeService.rejeterSignataire(signataireId, id, request));
    }
}