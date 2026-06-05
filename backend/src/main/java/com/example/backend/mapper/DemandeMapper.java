package com.example.backend.mapper;

import com.example.backend.dto.request.DemandeRequestDTO;
import com.example.backend.dto.response.DemandeResponseDTO;
import com.example.backend.entity.Demande;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface DemandeMapper {

    @Mapping(target = "interim.id", source = "interimId")
    Demande toEntity(DemandeRequestDTO dto);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userNomComplet", expression = "java(demande.getUser().getPrenom() + \" \" + demande.getUser().getNom())")
    @Mapping(target = "userServiceNom", source = "user.service.nom")
    @Mapping(target = "interimId", source = "interim.id")
    @Mapping(target = "interimNomComplet", expression = "java(demande.getInterim().getPrenom() + \" \" + demande.getInterim().getNom())")
    @Mapping(target = "piecesJustificatives", source = "piecesJustificatives")  // ADD THIS

    DemandeResponseDTO toDTO(Demande demande);

    List<DemandeResponseDTO> toDTOList(List<Demande> demandes);
}