// service/DemandeHistoriqueService.java
package com.example.backend.service;

import com.example.backend.dto.response.DemandeHistoriqueResponseDTO;
import com.example.backend.entity.DemandeHistorique;
import com.example.backend.entity.User;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.DemandeHistoriqueRepository;
import com.example.backend.repository.DemandeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DemandeHistoriqueService {

    private final DemandeHistoriqueRepository historiqueRepository;
    private final DemandeRepository demandeRepository;

    public List<DemandeHistoriqueResponseDTO> getHistoriquePourDemande(Long demandeId) {
        if (!demandeRepository.existsById(demandeId)) {
            throw new ResourceNotFoundException("Demande introuvable : " + demandeId);
        }
        return historiqueRepository
                .findByDemandeIdOrderByDateActionAsc(demandeId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public List<DemandeHistoriqueResponseDTO> getToutesLesActions() {
        return historiqueRepository
                .findAll(org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.DESC, "dateAction"))
                .stream()
                .map(this::toDTO)
                .toList();
    }

    private DemandeHistoriqueResponseDTO toDTO(DemandeHistorique h) {
        User acteur = h.getModifiePar();
        String roleStr = acteur != null && !acteur.getRoles().isEmpty()
                ? acteur.getRoles().iterator().next().getName()
                : "";

        return new DemandeHistoriqueResponseDTO(
                h.getId(),
                h.getDemande().getId(),
                h.getStatutAction().name(),
                h.getCommentaire(),
                h.getDateAction(),
                acteur != null ? acteur.getNom() : "Système",
                acteur != null ? acteur.getPrenom() : "",
                acteur != null ? acteur.getEmail() : "",
                roleStr
        );
    }
}