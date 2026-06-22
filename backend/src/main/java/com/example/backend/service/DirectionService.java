package com.example.backend.service;

import com.example.backend.dto.request.DirectionRequestDTO;
import com.example.backend.dto.response.DirectionResponseDTO;
import com.example.backend.entity.Direction;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.DirectionMapper;
import com.example.backend.repository.DirectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DirectionService {

    private final DirectionRepository directionRepository;
    private final DirectionMapper directionMapper;

    public List<DirectionResponseDTO> getAll() {
        return directionMapper.toDTOList(directionRepository.findAll());
    }

    @Transactional
    public DirectionResponseDTO create(DirectionRequestDTO request) {
        if (directionRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Code direction déjà existant: " + request.getCode(), ErrorCode.CODE_ALREADY_EXISTS, Map.of("value", request.getCode()));
        }
        Direction direction = directionMapper.toEntity(request);
        return directionMapper.toDTO(directionRepository.save(direction));
    }

    @Transactional
    public DirectionResponseDTO update(Long id, DirectionRequestDTO request) {
        Direction d = directionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Direction non trouvée", ErrorCode.RESOURCE_NOT_FOUND));
        d.setNom(request.getNom());
        d.setCode(request.getCode());
        return directionMapper.toDTO(directionRepository.save(d));
    }

    @Transactional
    public void delete(Long id) {
        if (!directionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Direction non trouvée", ErrorCode.RESOURCE_NOT_FOUND);
        }
        directionRepository.deleteById(id);
    }
}