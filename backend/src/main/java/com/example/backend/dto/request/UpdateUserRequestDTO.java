package com.example.backend.dto.request;

import lombok.Data;

@Data
public class UpdateUserRequestDTO {

    private String nom;
    private String prenom;
    private String grade;
    private Long serviceId;
    private Long roleId;
}