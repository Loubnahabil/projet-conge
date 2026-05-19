package com.example.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateUserRequestDTO {

    @NotBlank(message = "Nom est obligatoire")
    private String nom;

    @NotBlank(message = "Prénom est obligatoire")
    private String prenom;

    @NotBlank(message = "Email est obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "Mot de passe est obligatoire")
    @Size(min = 6, message = "Minimum 6 caractères")
    private String password;

    @NotBlank(message = "PPR est obligatoire")
    private String ppr;

    @NotBlank(message = "Grade est obligatoire")
    private String grade;

    @NotNull(message = "Date début fonction est obligatoire")
    private LocalDate dateDebutFonction;

    @NotNull(message = "Service est obligatoire")
    private Long serviceId;

    @NotNull(message = "Rôle est obligatoire")
    private Long roleId;
}