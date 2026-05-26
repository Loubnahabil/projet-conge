package com.example.backend.repository;

import com.example.backend.entity.Demande;
import com.example.backend.entity.StatutDemande;
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

    // =========================================================================
    // 🔍 HIERARCHY QUERIES FOR SUPERVISOR DASHBOARDS
    // =========================================================================

    // Level 1: Fetch pending requests for a specific Service ID
    List<Demande> findByUser_Service_IdAndStatut(Long serviceId, StatutDemande statut);

    // Level 2: Fetch pending requests for an entire Division ID branch
    List<Demande> findByUser_Service_Division_IdAndStatut(Long divisionId, StatutDemande statut);

    // ✅ Level 3: FIXED - Explicit JPQL Join path to guarantee precise Direction ID structural matching
    @Query("SELECT d FROM Demande d " +
            "JOIN d.user u " +
            "JOIN u.service s " +
            "JOIN s.division div " +
            "JOIN div.direction dir " +
            "WHERE dir.id = :directionId AND d.statut = :statut")
    List<Demande> findByDirectionIdAndStatut(
            @Param("directionId") Long directionId,
            @Param("statut") StatutDemande statut
    );

    // =========================================================================
    // 🔒 EXISTING LEAVE VALIDATION GUARD CLAUSES
    // =========================================================================

    // Checks for overlapping leave periods excluding dead states (REJETEE, ANNULEE)
    @Query("SELECT COUNT(d) > 0 FROM Demande d WHERE d.user.id = :userId " +
            "AND d.statut NOT IN (com.example.backend.entity.StatutDemande.REJETEE_CHEF, com.example.backend.entity.StatutDemande.REJETEE_DIRECTEUR, com.example.backend.entity.StatutDemande.ANNULEE) " +
            "AND d.dateDebut <= :dateFinReq AND d.dateFin >= :dateDebutReq")
    boolean hasOverlappingLeave(
            @Param("userId") Long userId,
            @Param("dateDebutReq") LocalDate dateDebutReq,
            @Param("dateFinReq") LocalDate dateFinReq
    );

    // Checks if the selected interim colleague is already away on an active or approved leave during this period
    @Query("SELECT COUNT(d) > 0 FROM Demande d WHERE d.interim.id = :interimId " +
            "AND d.statut IN (com.example.backend.entity.StatutDemande.SOUMISE, com.example.backend.entity.StatutDemande.VISEE_CHEF, com.example.backend.entity.StatutDemande.SIGNEE_DIRECTEUR) " +
            "AND d.dateDebut <= :dateFinReq AND d.dateFin >= :dateDebutReq")
    boolean isInterimOnLeave(
            @Param("interimId") Long interimId,
            @Param("dateDebutReq") LocalDate dateDebutReq,
            @Param("dateFinReq") LocalDate dateFinReq
    );

    @Query("SELECT d.statut, COUNT(d) FROM Demande d GROUP BY d.statut")
    List<Object[]> countByStatut();

    // ── Count by type de congé ────────────────────────────────────────────────────
    @Query("SELECT d.typeConge, COUNT(d) FROM Demande d GROUP BY d.typeConge")
    List<Object[]> countByTypeConge();

    // ── Count by direction ────────────────────────────────────────────────────────
    @Query("SELECT dir.nom, COUNT(d) FROM Demande d " +
            "JOIN d.user u JOIN u.service s JOIN s.division div JOIN div.direction dir " +
            "GROUP BY dir.nom ORDER BY COUNT(d) DESC")
    List<Object[]> countByDirection();

    // ── Count by month for a given year ──────────────────────────────────────────
    @Query("SELECT MONTH(d.dateDemande), COUNT(d) FROM Demande d " +
            "WHERE YEAR(d.dateDemande) = :annee " +
            "GROUP BY MONTH(d.dateDemande) ORDER BY MONTH(d.dateDemande)")
    List<Object[]> countByMoisForAnnee(@Param("annee") int annee);

    // ── Count by statut for a given statut value (used for en-cours counts) ───────
    long countByStatut(StatutDemande statut);

}