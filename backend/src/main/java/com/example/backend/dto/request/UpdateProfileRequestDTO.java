package com.example.backend.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequestDTO {
    private String nom;
    private String prenom;
    private String email;
    private String currentPassword;
    private String newPassword;
}