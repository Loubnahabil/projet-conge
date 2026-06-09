package com.example.backend.repository;

import com.example.backend.entity.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    boolean existsByCode(String code);
    List<ServiceEntity> findByDivisionId(Long divisionId);
}