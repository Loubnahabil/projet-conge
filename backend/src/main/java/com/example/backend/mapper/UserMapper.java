package com.example.backend.mapper;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    // will be used more in fonctionnaire CRUD
    // login response is built manually in AuthService
}