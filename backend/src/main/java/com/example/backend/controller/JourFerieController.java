package com.example.backend.controller;

import com.example.backend.dto.request.JourFerieRequestDTO;
import com.example.backend.dto.response.JourFerieResponseDTO;
import com.example.backend.service.JourFerieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jours-feries")
@RequiredArgsConstructor
public class JourFerieController {

    private final JourFerieService jourFerieService;

    // GET /api/jours-feries
    @GetMapping
    public ResponseEntity<List<JourFerieResponseDTO>> getAll() {
        return ResponseEntity.ok(jourFerieService.getAll());
    }

    // GET /api/jours-feries/1
    @GetMapping("/{id}")
    public ResponseEntity<JourFerieResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(jourFerieService.getById(id));
    }

    // POST /api/jours-feries
    @PostMapping
    public ResponseEntity<JourFerieResponseDTO> create(
            @Valid @RequestBody JourFerieRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jourFerieService.create(request));
    }

    // PUT /api/jours-feries/1
    @PutMapping("/{id}")
    public ResponseEntity<JourFerieResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody JourFerieRequestDTO request) {
        return ResponseEntity.ok(jourFerieService.update(id, request));
    }

    // DELETE /api/jours-feries/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        jourFerieService.delete(id);
        return ResponseEntity.noContent().build();
    }
}