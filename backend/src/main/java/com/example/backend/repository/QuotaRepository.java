package com.example.backend.repository;

import com.example.backend.entity.Quota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface QuotaRepository extends JpaRepository<Quota, Long> {

    // Finds the specific holiday balance for a user for a given administrative year
    Optional<Quota> findByUserIdAndAnnee(Long userId, int annee);
}