package com.example.backend.service;

import com.example.backend.dto.request.JourFerieRequestDTO;
import com.example.backend.dto.response.JourFerieResponseDTO;
import com.example.backend.entity.JourFerie;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.JourFerieMapper;
import com.example.backend.repository.JourFerieRepository;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JourFerieService {

    private static final List<FixedHoliday> FIXED_HOLIDAYS = List.of(
            new FixedHoliday(1, 1, "Nouvel An"),
            new FixedHoliday(11, 1, "Manifeste de l'Indépendance"),
            new FixedHoliday(1, 5, "Fête du Travail"),
            new FixedHoliday(30, 7, "Fête du Trône"),
            new FixedHoliday(14, 8, "Journée Oued Ed-Dahab"),
            new FixedHoliday(20, 8, "Révolution du Roi et du Peuple"),
            new FixedHoliday(21, 8, "Fête de la Jeunesse"),
            new FixedHoliday(6, 11, "Marche Verte"),
            new FixedHoliday(18, 11, "Fête de l'Indépendance")
    );

    private static final int SEED_YEARS_AHEAD = 2;

    private final JourFerieRepository jourFerieRepository;
    private final JourFerieMapper jourFerieMapper;

    @PostConstruct
    @Transactional
    public void seedFixedHolidays() {
        int currentYear = Year.now().getValue();
        for (int year = currentYear; year <= currentYear + SEED_YEARS_AHEAD; year++) {
            for (FixedHoliday f : FIXED_HOLIDAYS) {
                LocalDate date = f.toDate(year);
                if (!jourFerieRepository.existsByDate(date)) {
                    JourFerie j = JourFerie.builder()
                            .date(date)
                            .libelle(f.label)
                            .build();
                    jourFerieRepository.save(j);
                }
            }
        }
    }

    private record FixedHoliday(int day, int month, String label) {
        LocalDate toDate(int year) {
            return LocalDate.of(year, month, day);
        }
    }

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