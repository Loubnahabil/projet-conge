package com.example.backend.service;

import com.example.backend.dto.request.QuotaRequestDTO;
import com.example.backend.dto.response.QuotaResponseDTO;
import com.example.backend.entity.Quota;
import com.example.backend.entity.User;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.QuotaMapper;
import com.example.backend.repository.QuotaRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuotaService {

    private final QuotaRepository quotaRepository;
    private final QuotaMapper quotaMapper;
    private final UserRepository userRepository;

    // Get a specific user's quota profile for a particular year
    @Transactional(readOnly = true)
    public QuotaResponseDTO getByUserIdAndAnnee(Long userId, int annee) {
        Quota quota = quotaRepository.findByUserIdAndAnnee(userId, annee)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucun quota trouvé pour cet utilisateur et cette année: " + annee));
        QuotaResponseDTO dto = quotaMapper.toDTO(quota);
        dto.setGrade(quota.getUser().getGrade());
        return dto;
    }

    // Returns a paginated list of all users with their quota for the given year
    @Transactional(readOnly = true)
    public Page<QuotaResponseDTO> getQuotasPage(int annee, Pageable pageable) {
        // 1. Fetch one page of users
        Page<User> usersPage = userRepository.findAll(pageable);
        List<Long> userIds = usersPage.getContent().stream().map(User::getId).toList();

        // 2. Batch-fetch quotas for all users on this page (1 query instead of N)
        List<Quota> existingQuotas = quotaRepository.findByUserIdInAndAnnee(userIds, annee);
        Map<Long, Quota> quotaByUserId = existingQuotas.stream()
                .collect(Collectors.toMap(q -> q.getUser().getId(), q -> q));

        // 3. Build rows: real quota if exists, default placeholder if not
        return usersPage.map(user -> {
            Quota q = quotaByUserId.get(user.getId());
            if (q != null) {
                return QuotaResponseDTO.builder()
                        .id(q.getId())
                        .userId(user.getId())
                        .userNomComplet(user.getPrenom() + " " + user.getNom())
                        .grade(user.getGrade())
                        .annee(q.getAnnee())
                        .joursAlloues(q.getJoursAlloues())
                        .joursUtilises(q.getJoursUtilises())
                        .joursRestants(q.getJoursRestants())
                        .build();
            } else {
                return QuotaResponseDTO.builder()
                        .id(-user.getId())
                        .userId(user.getId())
                        .userNomComplet(user.getPrenom() + " " + user.getNom())
                        .grade(user.getGrade())
                        .annee(annee)
                        .joursAlloues(30)
                        .joursUtilises(0)
                        .joursRestants(30)
                        .build();
            }
        });
    }

    // Allows Admin to manually adjust allocated and used days
    @Transactional
    public QuotaResponseDTO updateQuota(Long id, QuotaRequestDTO request) {
        Quota quota = quotaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quota introuvable avec l'id: " + id));

        quota.setJoursAlloues(request.getJoursAlloues());
        quota.setJoursUtilises(request.getJoursUtilises());

        // Dynamic structural update formula: remaining = allocated - used
        quota.setJoursRestants(request.getJoursAlloues() - request.getJoursUtilises());

        QuotaResponseDTO dto = quotaMapper.toDTO(quotaRepository.save(quota));
        dto.setGrade(quota.getUser().getGrade());
        return dto;
    }
}
