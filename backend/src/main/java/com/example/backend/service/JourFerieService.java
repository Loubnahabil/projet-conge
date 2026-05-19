package com.example.backend.service;

import com.example.backend.dto.request.JourFerieRequestDTO;
import com.example.backend.dto.response.JourFerieResponseDTO;
import com.example.backend.entity.JourFerie;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.JourFerieMapper;
import com.example.backend.repository.JourFerieRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JourFerieService {

    private final JourFerieRepository jourFerieRepository;
    private final JourFerieMapper jourFerieMapper;

    // GET all holidays
    public List<JourFerieResponseDTO> getAll() {
        return jourFerieMapper.toDTOList(jourFerieRepository.findAll());
    }

    // GET one by id
    public JourFerieResponseDTO getById(Long id) {
        JourFerie jourFerie = jourFerieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Jour férié non trouvé avec l'id: " + id));
        return jourFerieMapper.toDTO(jourFerie);
    }

    // CREATE
    @Transactional
    public JourFerieResponseDTO create(JourFerieRequestDTO request) {

        // check date not already exists
        if (jourFerieRepository.existsByDate(request.getDate())) {
            throw new DuplicateResourceException(
                    "Un jour férié existe déjà pour cette date: " + request.getDate());
        }

        JourFerie jourFerie = jourFerieMapper.toEntity(request);
        return jourFerieMapper.toDTO(jourFerieRepository.save(jourFerie));
    }

    // UPDATE
    @Transactional
    public JourFerieResponseDTO update(Long id, JourFerieRequestDTO request) {

        JourFerie jourFerie = jourFerieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Jour férié non trouvé avec l'id: " + id));

        // check new date not already used by another record
        if (!jourFerie.getDate().equals(request.getDate()) &&
                jourFerieRepository.existsByDate(request.getDate())) {
            throw new DuplicateResourceException(
                    "Un jour férié existe déjà pour cette date: " + request.getDate());
        }

        jourFerie.setDate(request.getDate());
        jourFerie.setLibelle(request.getLibelle());

        return jourFerieMapper.toDTO(jourFerieRepository.save(jourFerie));
    }

    // DELETE
    @Transactional
    public void delete(Long id) {
        if (!jourFerieRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Jour férié non trouvé avec l'id: " + id);
        }
        jourFerieRepository.deleteById(id);
    }
}