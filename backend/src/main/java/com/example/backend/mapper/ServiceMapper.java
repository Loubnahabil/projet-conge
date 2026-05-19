package com.example.backend.mapper;

import com.example.backend.dto.request.ServiceRequestDTO;
import com.example.backend.dto.response.ServiceResponseDTO;
import com.example.backend.entity.ServiceEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ServiceMapper {

    // Map fields from the parent Division entity to the flat Service DTO
    @Mapping(target = "divisionId", source = "division.id")
    @Mapping(target = "divisionNom", source = "division.nom")
    ServiceResponseDTO toDTO(ServiceEntity service);

    ServiceEntity toEntity(ServiceRequestDTO dto);

    List<ServiceResponseDTO> toDTOList(List<ServiceEntity> services);
}