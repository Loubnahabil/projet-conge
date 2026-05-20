package com.example.backend.dto.request;

import com.example.backend.entity.TypeConge;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class DemandeRequestDTO {

    @NotNull(message = "La date de début est obligatoire")
    private LocalDate dateDebut;

    @NotNull(message = "La date de fin est obligatoire")
    private LocalDate dateFin;

    @NotNull(message = "Le type de congé est obligatoire")
    private TypeConge typeConge;

    @NotNull(message = "L'intérimaire est obligatoire")
    private Long interimId;
}