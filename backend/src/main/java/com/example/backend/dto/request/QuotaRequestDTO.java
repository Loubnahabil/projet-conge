
package com.example.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuotaRequestDTO {

    @NotNull(message = "Le nombre de jours alloués est obligatoire")
    @Min(value = 0, message = "Le quota ne peut pas être négatif")
    @Max(value = 90, message = "Le quota ne peut pas dépasser 90 jours")
    private Integer joursAlloues;

    @NotNull(message = "Le nombre de jours utilisés est obligatoire")
    @Min(value = 0, message = "Les jours utilisés ne peuvent pas être négatifs")
    private Integer joursUtilises;
}