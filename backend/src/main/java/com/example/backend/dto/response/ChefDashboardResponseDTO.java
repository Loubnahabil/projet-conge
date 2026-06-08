package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ChefDashboardResponseDTO {
    private long enAttenteVisa;
    private long totalTraitees;
    private long approuvees;
    private long rejetees;
    private List<DemandeResponseDTO> demandesRecentes;
}
