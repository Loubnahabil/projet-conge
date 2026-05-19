package com.example.backend.dto.request;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DirectionRequestDTO {
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;
    @NotBlank(message = "Le code est obligatoire")
    private String code;
}