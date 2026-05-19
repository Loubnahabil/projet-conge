package com.example.backend.service;

import com.example.backend.dto.request.DivisionRequestDTO;
import com.example.backend.dto.response.DivisionResponseDTO;
import com.example.backend.entity.Direction;
import com.example.backend.entity.Division;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.DivisionMapper;
import com.example.backend.repository.DirectionRepository;
import com.example.backend.repository.DivisionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DivisionService {

    private final DivisionRepository divisionRepository;
    private final DirectionRepository directionRepository;
    private final DivisionMapper divisionMapper;

    public List<DivisionResponseDTO> getAll() {
        return divisionMapper.toDTOList(divisionRepository.findAll());
    }

    @Transactional
    public DivisionResponseDTO create(DivisionRequestDTO request) {
        Direction parentDirection = directionRepository.findById(request.getDirectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Direction parente introuvable"));

        if (divisionRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Code division déjà existant: " + request.getCode());
        }

        Division division = divisionMapper.toEntity(request);
        division.setDirection(parentDirection);
        return divisionMapper.toDTO(divisionRepository.save(division));
    }

    @Transactional
    public DivisionResponseDTO update(Long id, DivisionRequestDTO request) {
        Division div = divisionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Division non trouvée"));
        Direction parentDirection = directionRepository.findById(request.getDirectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Direction parente introuvable"));

        div.setNom(request.getNom());
        div.setCode(request.getCode());
        div.setDirection(parentDirection);
        return divisionMapper.toDTO(divisionRepository.save(div));
    }

    @Transactional
    public void delete(Long id) {
        if (!divisionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Division non trouvée");
        }
        divisionRepository.deleteById(id);
    }
}