package com.example.backend.service;

import com.example.backend.dto.request.CreateUserRequestDTO;
import com.example.backend.dto.request.UpdateUserRequestDTO;
import com.example.backend.dto.request.UpdateProfileRequestDTO; // Added import for profile update DTO
import com.example.backend.dto.response.UserResponseDTO;
import com.example.backend.entity.Quota;
import com.example.backend.entity.Role;
import com.example.backend.entity.ServiceEntity;
import com.example.backend.entity.User;
import com.example.backend.exception.BusinessException;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.QuotaRepository;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.ServiceRepository;
import com.example.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ServiceRepository serviceRepository;
    private final QuotaRepository quotaRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    // GET all with search and pagination
    public Page<UserResponseDTO> getAll(String search, int page, int size) {
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

    // GET colleagues from same service
    public List<UserResponseDTO> getColleaguesFromSameService(String email) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Fonctionnaire connecté introuvable"));

        if (currentUser.getService() == null) {
            return Collections.emptyList();
        }

        Long serviceId = currentUser.getService().getId();
        List<User> colleagues = userRepository.findByServiceIdAndIdNot(serviceId, currentUser.getId());

        return colleagues.stream()
                .map(userMapper::toDTO)
                .toList();
    }

    // GET one by id
    public UserResponseDTO getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Fonctionnaire non trouvé avec l'id: " + id));
        return userMapper.toDTO(user);
    }

    // GET one by email
    public UserResponseDTO getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        return userMapper.toDTO(user);
    }

    // UPDATE own profile
    @Transactional
    public UserResponseDTO updateMyProfile(String email, UpdateProfileRequestDTO request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        if (request.getNom() != null) user.setNom(request.getNom());
        if (request.getPrenom() != null) user.setPrenom(request.getPrenom());

        if (request.getEmail() != null && !request.getEmail().equals(email)) {
            if (userRepository.existsByEmail(request.getEmail()))
                throw new BusinessException("Cet email est déjà utilisé.");
            user.setEmail(request.getEmail());
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword()))
                throw new BusinessException("Mot de passe actuel incorrect.");
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        return userMapper.toDTO(userRepository.save(user));
    }

    // CREATE
    @Transactional
    public UserResponseDTO create(CreateUserRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email déjà utilisé: " + request.getEmail());
        }

        if (userRepository.existsByPpr(request.getPpr())) {
            throw new DuplicateResourceException("PPR déjà utilisé: " + request.getPpr());
        }

        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service non trouvé"));

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Rôle non trouvé"));

        // 1 CHEF per service
        if (role.getName().equalsIgnoreCase("CHEF_HIERARCHIE") || role.getName().equalsIgnoreCase("ROLE_CHEF_HIERARCHIE")) {
            boolean chefExists = userRepository.findByService_Id(service.getId()).stream()
                    .anyMatch(u -> u.getRoles().stream()
                            .anyMatch(r -> r.getName().equalsIgnoreCase("CHEF_HIERARCHIE") || r.getName().equalsIgnoreCase("ROLE_CHEF_HIERARCHIE")));
            if (chefExists) {
                throw new DuplicateResourceException("Ce service a déjà un chef hiérarchique assigné.");
            }
        }

        // 1 SIGNATAIRE per direction
        if (role.getName().equalsIgnoreCase("SIGNATAIRE") || role.getName().equalsIgnoreCase("ROLE_SIGNATAIRE")) {
            if (service.getDivision() == null || service.getDivision().getDirection() == null) {
                throw new BusinessException("Ce service n'est pas rattaché à une direction.");
            }
            Long directionId = service.getDivision().getDirection().getId();
            boolean signataireExists = userRepository.findAll().stream()
                    .filter(u -> u.getService() != null && u.getService().getDivision() != null
                            && u.getService().getDivision().getDirection() != null)
                    .filter(u -> u.getService().getDivision().getDirection().getId().equals(directionId))
                    .anyMatch(u -> u.getRoles().stream()
                            .anyMatch(r -> r.getName().equalsIgnoreCase("SIGNATAIRE") || r.getName().equalsIgnoreCase("ROLE_SIGNATAIRE")));
            if (signataireExists) {
                throw new DuplicateResourceException("Cette direction a déjà un signataire assigné.");
            }
        }

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
    public UserResponseDTO update(Long id, UpdateUserRequestDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Fonctionnaire non trouvé avec l'id: " + id));

        if (request.getNom() != null) user.setNom(request.getNom());
        if (request.getPrenom() != null) user.setPrenom(request.getPrenom());
        if (request.getGrade() != null) user.setGrade(request.getGrade());

        if (request.getServiceId() != null) {
            ServiceEntity service = serviceRepository.findById(request.getServiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service non trouvé"));
            user.setService(service);
        }

        if (request.getRoleId() != null) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Rôle non trouvé"));

            ServiceEntity serviceToCheck = request.getServiceId() != null
                    ? serviceRepository.findById(request.getServiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service non trouvé"))
                    : user.getService();

            // 1 CHEF per service
            if (role.getName().equalsIgnoreCase("CHEF_HIERARCHIE") || role.getName().equalsIgnoreCase("ROLE_CHEF_HIERARCHIE")) {
                boolean chefExists = userRepository.findByService_Id(serviceToCheck.getId()).stream()
                        .filter(u -> !u.getId().equals(id)) // exclude current user
                        .anyMatch(u -> u.getRoles().stream()
                                .anyMatch(r -> r.getName().equalsIgnoreCase("CHEF_HIERARCHIE") || r.getName().equalsIgnoreCase("ROLE_CHEF_HIERARCHIE")));
                if (chefExists) {
                    throw new DuplicateResourceException("Ce service a déjà un chef hiérarchique assigné.");
                }
            }

            // 1 SIGNATAIRE per direction
            if (role.getName().equalsIgnoreCase("SIGNATAIRE") || role.getName().equalsIgnoreCase("ROLE_SIGNATAIRE")) {
                if (serviceToCheck.getDivision() == null || serviceToCheck.getDivision().getDirection() == null) {
                    throw new BusinessException("Ce service n'est pas rattaché à une direction.");
                }
                Long directionId = serviceToCheck.getDivision().getDirection().getId();
                boolean signataireExists = userRepository.findAll().stream()
                        .filter(u -> !u.getId().equals(id)) // exclude current user
                        .filter(u -> u.getService() != null && u.getService().getDivision() != null
                                && u.getService().getDivision().getDirection() != null)
                        .filter(u -> u.getService().getDivision().getDirection().getId().equals(directionId))
                        .anyMatch(u -> u.getRoles().stream()
                                .anyMatch(r -> r.getName().equalsIgnoreCase("SIGNATAIRE") || r.getName().equalsIgnoreCase("ROLE_SIGNATAIRE")));
                if (signataireExists) {
                    throw new DuplicateResourceException("Cette direction a déjà un signataire assigné.");
                }
            }

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