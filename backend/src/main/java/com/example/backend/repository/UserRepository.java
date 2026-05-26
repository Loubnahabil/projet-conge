package com.example.backend.repository;

import com.example.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPpr(String ppr);

    Page<User> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseOrPprContainingIgnoreCase(
            String nom, String prenom, String ppr, Pageable pageable
    );

    // Finds all users in the same service, excluding the logged-in user
    List<User> findByServiceIdAndIdNot(Long serviceId, Long userId);

    List<User> findByService_Id(Long serviceId);
}