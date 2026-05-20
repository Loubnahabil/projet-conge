package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pieces_justificatives")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "demande")
public class PieceJustificative {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demande_id", nullable = false)
    private Demande demande;

    @Column(name = "nom_fichier", nullable = false)
    private String nomFichier;

    @Column(name = "url_fichier", nullable = false)
    private String urlFichier;

    @Column(name = "type_document", nullable = false, length = 100)
    private String typeDocument; // e.g., "CERTIFICAT_MEDICAL", "DECISION_SIGNEE"

    @Column(name = "date_upload", nullable = false)
    private LocalDateTime dateUpload;
}