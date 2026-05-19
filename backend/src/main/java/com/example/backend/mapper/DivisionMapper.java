package com.example.backend.mapper;

import com.example.backend.dto.request.DivisionRequestDTO;
import com.example.backend.dto.response.DivisionResponseDTO;
import com.example.backend.entity.Division;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface DivisionMapper {

    // "source = direction.id" means: go inside the entity's direction property, get the id, and save it in directionId inside the DTO
    @Mapping(target = "directionId", source = "direction.id")
    @Mapping(target = "directionNom", source = "direction.nom")
    DivisionResponseDTO toDTO(Division division);

    Division toEntity(DivisionRequestDTO dto);

    List<DivisionResponseDTO> toDTOList(List<Division> divisions);
}