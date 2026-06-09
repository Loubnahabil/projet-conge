package com.example.backend.repository;

import com.example.backend.entity.Division;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DivisionRepository extends JpaRepository<Division, Long> {
    boolean existsByCode(String code);
    List<Division> findByDirectionId(Long directionId);
}