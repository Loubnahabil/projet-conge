package com.example.backend.repository;

import com.example.backend.entity.DemandeHistorique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DemandeHistoriqueRepository extends JpaRepository<DemandeHistorique, Long> {
    // Fetches history ordered by timestamp so the log reads sequentially
    List<DemandeHistorique> findByDemandeIdOrderByDateActionAsc(Long demandeId);
}
