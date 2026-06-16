package com.example.backend.service;

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

    @Transactional(readOnly = true)
    public QuotaResponseDTO getByUserIdAndAnnee(Long userId, int annee) {
        Quota quota = quotaRepository.findByUserIdAndAnnee(userId, annee)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucun quota trouvé pour cet utilisateur et cette année: " + annee));
        QuotaResponseDTO dto = quotaMapper.toDTO(quota);
        dto.setGrade(quota.getUser().getGrade());
        return dto;
    }

    @Transactional(readOnly = true)
    public Page<QuotaResponseDTO> getQuotasPage(int annee, Pageable pageable) {
        Page<User> usersPage = userRepository.findAll(pageable);
        List<Long> userIds = usersPage.getContent().stream().map(User::getId).toList();

        List<Quota> existingQuotas = quotaRepository.findByUserIdInAndAnnee(userIds, annee);
        Map<Long, Quota> quotaByUserId = existingQuotas.stream()
                .collect(Collectors.toMap(q -> q.getUser().getId(), q -> q));

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
}
