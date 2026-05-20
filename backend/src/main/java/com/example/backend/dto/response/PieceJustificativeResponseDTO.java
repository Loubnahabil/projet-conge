package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PieceJustificativeResponseDTO {
    private Long id;
    private Long demandeId;
    private String nomFichier;
    private String urlFichier;
    private String typeDocument;
    private LocalDateTime dateUpload;
}