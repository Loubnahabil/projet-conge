package com.example.backend.controller;

import com.example.backend.dto.response.RoleResponseDTO;
import com.example.backend.entity.Role;
import com.example.backend.repository.RoleRepository; // or your RoleService if you have one
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    // You can swap this with RoleService if you have a service layer set up for Roles!
    private final RoleRepository roleRepository;

    @GetMapping
    public ResponseEntity<List<RoleResponseDTO>> getAllRoles() {
        List<Role> roles = roleRepository.findAll();

        List<RoleResponseDTO> responseDTOs = roles.stream()
                .map(role -> new RoleResponseDTO(role.getId(), role.getName()))
                .toList();

        return ResponseEntity.ok(responseDTOs);
    }
}