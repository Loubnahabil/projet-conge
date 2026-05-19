package com.example.backend.service;

import com.example.backend.dto.request.QuotaRequestDTO;
import com.example.backend.dto.response.QuotaResponseDTO;
import com.example.backend.entity.Quota;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.QuotaMapper;
import com.example.backend.repository.QuotaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class QuotaService {

    private final QuotaRepository quotaRepository;
    private final QuotaMapper quotaMapper;

    // Get a specific user's quota profile for a particular year
    @Transactional(readOnly = true)
    public QuotaResponseDTO getByUserIdAndAnnee(Long userId, int annee) {
        Quota quota = quotaRepository.findByUserIdAndAnnee(userId, annee)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucun quota trouvé pour cet utilisateur et cette année: " + annee));
        return quotaMapper.toDTO(quota);
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

        return quotaMapper.toDTO(quotaRepository.save(quota));
    }
}