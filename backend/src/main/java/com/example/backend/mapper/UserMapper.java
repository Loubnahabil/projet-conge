package com.example.backend.mapper;

import com.example.backend.dto.response.UserResponseDTO;
import com.example.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // maps nested objects to flat DTO fields
    @Mapping(target = "serviceId", source = "service.id")
    @Mapping(target = "serviceNom", source = "service.nom")
    @Mapping(target = "divisionId", source = "service.division.id")
    @Mapping(target = "divisionNom", source = "service.division.nom")
    @Mapping(target = "directionId", source = "service.division.direction.id")
    @Mapping(target = "directionNom", source = "service.division.direction.nom")
    // gets first role from the set
    @Mapping(target = "role", expression = "java(user.getRoles().stream().findFirst().map(r -> r.getName()).orElse(null))")
    UserResponseDTO toDTO(User user);

    List<UserResponseDTO> toDTOList(List<User> users);
}