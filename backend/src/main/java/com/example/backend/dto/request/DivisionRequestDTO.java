package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DivisionRequestDTO {
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;
    @NotBlank(message = "Le code est obligatoire")
    private String code;
    @NotNull(message = "L'ID de la direction est obligatoire")
    private Long directionId;
}