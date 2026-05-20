package com.example.backend.repository;

import com.example.backend.entity.Demande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface DemandeRepository extends JpaRepository<Demande, Long> {

    // Finds all leave requests belonging to a specific employee
    List<Demande> findByUserId(Long userId);

    // Checks for overlapping leave periods excluding dead states (REJETEE, ANNULEE)
    @Query("SELECT COUNT(d) > 0 FROM Demande d WHERE d.user.id = :userId " +
            "AND d.statut NOT IN ('REJETEE_CHEF', 'REJETEE_DIRECTEUR', 'ANNULEE') " +
            "AND d.dateDebut <= :dateFinReq AND d.dateFin >= :dateDebutReq")
    boolean hasOverlappingLeave(
            @Param("userId") Long userId,
            @Param("dateDebutReq") LocalDate dateDebutReq,
            @Param("dateFinReq") LocalDate dateFinReq
    );

    // Checks if the selected interim colleague is already away on an active or approved leave during this period
    @Query("SELECT COUNT(d) > 0 FROM Demande d WHERE d.interim.id = :interimId " +
            "AND d.statut IN ('SOUMISE', 'VISEE_CHEF', 'SIGNEE_DIRECTEUR') " +
            "AND d.dateDebut <= :dateFinReq AND d.dateFin >= :dateDebutReq")
    boolean isInterimOnLeave(
            @Param("interimId") Long interimId,
            @Param("dateDebutReq") LocalDate dateDebutReq,
            @Param("dateFinReq") LocalDate dateFinReq
    );
}