package com.example.backend.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotaResponseDTO {
    private Long id;
    private Long userId;
    private String userNomComplet;
    private String grade;
    private int annee;
    private int joursAlloues;
    private int joursUtilises;
    private int joursRestants;
}