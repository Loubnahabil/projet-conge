package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "demande_historiques")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "demande")
public class DemandeHistorique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demande_id", nullable = false)
    private Demande demande;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modifie_par_id")
    private User modifiePar;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_action", nullable = false, length = 50)
    private StatutDemande statutAction;

    @Column(length = 255)
    private String commentaire;

    @Column(name = "date_action", nullable = false)
    private LocalDateTime dateAction;
}