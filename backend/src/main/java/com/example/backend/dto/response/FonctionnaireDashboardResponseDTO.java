package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class FonctionnaireDashboardResponseDTO {
    private int quotaAlloue;
    private int quotaUtilise;
    private int quotaRestant;
    private long totalDemandes;
    private long enAttenteVisa;
    private long approuvees;
    private long rejetees;
    private List<DemandeResponseDTO> demandesRecentes;
}
