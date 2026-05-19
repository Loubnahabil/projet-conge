package com.example.backend.mapper;

import com.example.backend.dto.response.QuotaResponseDTO;
import com.example.backend.entity.Quota;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface QuotaMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userNomComplet", expression = "java(quota.getUser().getPrenom() + \" \" + quota.getUser().getNom())")
    QuotaResponseDTO toDTO(Quota quota);

    List<QuotaResponseDTO> toDTOList(List<Quota> quotas);
}