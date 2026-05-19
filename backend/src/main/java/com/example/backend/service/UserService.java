package com.example.backend.service;

import com.example.backend.dto.request.CreateUserRequestDTO;
import com.example.backend.dto.request.UpdateUserRequestDTO;
import com.example.backend.dto.response.UserResponseDTO;
import com.example.backend.entity.Role;
import com.example.backend.entity.ServiceEntity;
import com.example.backend.entity.User;
import com.example.backend.entity.Quota; // Added import for Quota
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.ServiceRepository;
import com.example.backend.repository.QuotaRepository; // Added import for QuotaRepository
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ServiceRepository serviceRepository;
    private final QuotaRepository quotaRepository; // Added field injection
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    // GET all with search and pagination
    public Page<UserResponseDTO> getAll(
            String search, int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        if (search != null && !search.isBlank()) {
            return userRepository
                    .findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseOrPprContainingIgnoreCase(
                            search, search, search, pageable)
                    .map(userMapper::toDTO);
        }

        return userRepository.findAll(pageable)
                .map(userMapper::toDTO);
    }

    // GET one by id
    public UserResponseDTO getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Fonctionnaire non trouvé avec l'id: " + id));
        return userMapper.toDTO(user);
    }

    // CREATE
    @Transactional
    public UserResponseDTO create(
            CreateUserRequestDTO request) {

        // validate no duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Email déjà utilisé: " + request.getEmail());
        }

        // validate no duplicate ppr
        if (userRepository.existsByPpr(request.getPpr())) {
            throw new DuplicateResourceException(
                    "PPR déjà utilisé: " + request.getPpr());
        }

        // find service
        ServiceEntity service = serviceRepository
                .findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service non trouvé"));

        // find role
        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Rôle non trouvé"));

        // build and save user
        User user = User.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .ppr(request.getPpr())
                .grade(request.getGrade())
                .dateDebutFonction(request.getDateDebutFonction())
                .enabled(true)
                .service(service)
                .roles(new HashSet<>(Set.of(role)))
                .build();

        User savedUser = userRepository.save(user);

        // Initialize automatic 30-day baseline quota for the current administrative year
        int currentYear = java.time.LocalDate.now().getYear();
        Quota initialQuota = Quota.builder()
                .user(savedUser)
                .annee(currentYear)
                .joursAlloues(30)
                .joursUtilises(0)
                .joursRestants(30)
                .build();

        quotaRepository.save(initialQuota);

        return userMapper.toDTO(savedUser);
    }

    // UPDATE
    @Transactional
    public UserResponseDTO update(
            Long id, UpdateUserRequestDTO request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Fonctionnaire non trouvé avec l'id: " + id));

        if (request.getNom() != null) user.setNom(request.getNom());
        if (request.getPrenom() != null) user.setPrenom(request.getPrenom());
        if (request.getGrade() != null) user.setGrade(request.getGrade());

        if (request.getServiceId() != null) {
            ServiceEntity service = serviceRepository
                    .findById(request.getServiceId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Service non trouvé"));
            user.setService(service);
        }

        if (request.getRoleId() != null) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Rôle non trouvé"));
            user.setRoles(new HashSet<>(Set.of(role)));
        }

        return userMapper.toDTO(userRepository.save(user));
    }

    // TOGGLE active/inactive
    @Transactional
    public UserResponseDTO toggleEnabled(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Fonctionnaire non trouvé avec l'id: " + id));

        user.setEnabled(!user.getEnabled());
        return userMapper.toDTO(userRepository.save(user));
    }

    // DELETE
    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Fonctionnaire non trouvé avec l'id: " + id);
        }
        userRepository.deleteById(id);
    }
}