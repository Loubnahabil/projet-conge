package com.example.backend.controller;

import com.example.backend.dto.request.DirectionRequestDTO;
import com.example.backend.dto.response.DirectionResponseDTO;
import com.example.backend.service.DirectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/directions")
@RequiredArgsConstructor
public class DirectionController {

    private final DirectionService directionService;

    @GetMapping
    public ResponseEntity<List<DirectionResponseDTO>> getAll() {
        return ResponseEntity.ok(directionService.getAll());
    }

    @PostMapping
    public ResponseEntity<DirectionResponseDTO> create(@Valid @RequestBody DirectionRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(directionService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DirectionResponseDTO> update(@PathVariable Long id, @Valid @RequestBody DirectionRequestDTO request) {
        return ResponseEntity.ok(directionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        directionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}