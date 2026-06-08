package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class SignataireDashboardResponseDTO {
    private long enAttenteSignature;
    private long totalTraitees;
    private long signees;
    private long rejetees;
    private List<DemandeResponseDTO> demandesRecentes;
}
