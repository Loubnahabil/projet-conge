package com.example.backend.repository;

import com.example.backend.entity.JourFerie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface JourFerieRepository extends JpaRepository<JourFerie, Long> {

    // check if date already exists
    boolean existsByDate(LocalDate date);

    // find all holidays in a specific year
    // used when calculating working days for a leave request
    List<JourFerie> findByDateBetween(LocalDate start, LocalDate end);
}