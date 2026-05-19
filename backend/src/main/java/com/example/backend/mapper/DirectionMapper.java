package com.example.backend.mapper;

import com.example.backend.dto.request.DirectionRequestDTO;
import com.example.backend.dto.response.DirectionResponseDTO;
import com.example.backend.entity.Direction;
import org.mapstruct.Mapper;
import java.util.List;

@Mapper(componentModel = "spring")
public interface DirectionMapper {

    DirectionResponseDTO toDTO(Direction direction);

    Direction toEntity(DirectionRequestDTO dto);

    List<DirectionResponseDTO> toDTOList(List<Direction> directions);
}