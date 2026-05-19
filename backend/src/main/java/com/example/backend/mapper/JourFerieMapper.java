package com.example.backend.mapper;

import com.example.backend.dto.request.JourFerieRequestDTO;
import com.example.backend.dto.response.JourFerieResponseDTO;
import com.example.backend.entity.JourFerie;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface JourFerieMapper {

    JourFerieResponseDTO toDTO(JourFerie jourFerie);

    // maps request DTO to entity for create/update
    JourFerie toEntity(JourFerieRequestDTO dto);

    List<JourFerieResponseDTO> toDTOList(List<JourFerie> jourFeries);
}