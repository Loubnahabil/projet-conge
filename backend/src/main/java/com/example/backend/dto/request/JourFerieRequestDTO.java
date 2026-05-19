package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class JourFerieRequestDTO {

    @NotNull(message = "Date est obligatoire")
    private LocalDate date;

    @NotBlank(message = "Libellé est obligatoire")
    private String libelle;
}