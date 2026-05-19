package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DivisionResponseDTO {
    private Long id;
    private String nom;
    private String code;
    private Long directionId;
    private String directionNom;
}