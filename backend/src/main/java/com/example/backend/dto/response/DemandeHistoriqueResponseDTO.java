// dto/response/DemandeHistoriqueResponseDTO.java
package com.example.backend.dto.response;

import java.time.LocalDateTime;

public record DemandeHistoriqueResponseDTO(
        Long id,
        Long demandeId,
        String statutAction,
        String commentaire,
        LocalDateTime dateAction,
        String acteurNom,
        String acteurPrenom,
        String acteurEmail,
        String acteurRole
) {}