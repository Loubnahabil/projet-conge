package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quotas", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "annee"}, name = "uq_user_annee_quota")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private int annee;

    @Column(name = "jours_alloues", nullable = false)
    private int joursAlloues;

    @Column(name = "jours_utilises", nullable = false)
    private int joursUtilises;

    @Column(name = "jours_restants", nullable = false)
    private int joursRestants;
}