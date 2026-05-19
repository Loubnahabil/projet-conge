package com.example.backend.repository;

import com.example.backend.entity.Direction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DirectionRepository extends JpaRepository<Direction, Long> {
    boolean existsByCode(String code);
    boolean existsByNom(String nom);
}