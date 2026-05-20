package com.example.backend.dto.response;

import com.example.backend.entity.StatutDemande;
import com.example.backend.entity.TypeConge;
import lombok.Data;
import java.time.LocalDate;

@Data
public class DemandeResponseDTO {
    private Long id;
    private Long userId;
    private String userNomComplet;
    private String userServiceNom;
    private Long interimId;
    private String interimNomComplet;
    private LocalDate dateDemande;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private int duree;
    private TypeConge typeConge;
    private StatutDemande statut;
}