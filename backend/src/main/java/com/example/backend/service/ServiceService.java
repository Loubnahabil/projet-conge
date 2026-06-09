package com.example.backend.service;

import com.example.backend.dto.request.ServiceRequestDTO;
import com.example.backend.dto.response.ServiceResponseDTO;
import com.example.backend.entity.Division;
import com.example.backend.entity.ServiceEntity;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.ServiceMapper;
import com.example.backend.repository.DivisionRepository;
import com.example.backend.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final DivisionRepository divisionRepository;
    private final ServiceMapper serviceMapper;

    public List<ServiceResponseDTO> getAll() {
        return serviceMapper.toDTOList(serviceRepository.findAll());
    }

    public List<ServiceResponseDTO> getByDivisionId(Long divisionId) {
        return serviceMapper.toDTOList(serviceRepository.findByDivisionId(divisionId));
    }

    @Transactional
    public ServiceResponseDTO create(ServiceRequestDTO request) {
        Division parentDivision = divisionRepository.findById(request.getDivisionId())
                .orElseThrow(() -> new ResourceNotFoundException("Division parente introuvable"));

        if (serviceRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Code service déjà existant: " + request.getCode());
        }

        ServiceEntity serviceEntity = serviceMapper.toEntity(request);
        serviceEntity.setDivision(parentDivision);
        return serviceMapper.toDTO(serviceRepository.save(serviceEntity));
    }

    @Transactional
    public ServiceResponseDTO update(Long id, ServiceRequestDTO request) {
        ServiceEntity s = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service non trouvé"));
        Division parentDivision = divisionRepository.findById(request.getDivisionId())
                .orElseThrow(() -> new ResourceNotFoundException("Division parente introuvable"));

        s.setNom(request.getNom());
        s.setCode(request.getCode());
        s.setDivision(parentDivision);
        return serviceMapper.toDTO(serviceRepository.save(s));
    }

    @Transactional
    public void delete(Long id) {
        if (!serviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Service non trouvé");
        }
        serviceRepository.deleteById(id);
    }
}