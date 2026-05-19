package com.example.backend.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {

    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String ppr;
    private String grade;
    private LocalDate dateDebutFonction;
    private Boolean enabled;

    // service info
    private Long serviceId;
    private String serviceNom;

    // division info
    private Long divisionId;
    private String divisionNom;

    // direction info
    private Long directionId;
    private String directionNom;

    // role
    private String role;
}