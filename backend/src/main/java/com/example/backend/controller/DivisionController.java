package com.example.backend.controller;

import com.example.backend.dto.request.DivisionRequestDTO;
import com.example.backend.dto.response.DivisionResponseDTO;
import com.example.backend.service.DivisionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/divisions")
@RequiredArgsConstructor
//@PreAuthorize("hasAuthority('ADMIN')")
public class DivisionController {

    private final DivisionService divisionService;

    @GetMapping
    public ResponseEntity<List<DivisionResponseDTO>> getAll() {
        return ResponseEntity.ok(divisionService.getAll());
    }

    @PostMapping
    public ResponseEntity<DivisionResponseDTO> create(@Valid @RequestBody DivisionRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(divisionService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DivisionResponseDTO> update(@PathVariable Long id, @Valid @RequestBody DivisionRequestDTO request) {
        return ResponseEntity.ok(divisionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        divisionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}