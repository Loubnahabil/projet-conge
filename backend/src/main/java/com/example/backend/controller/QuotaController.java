package com.example.backend.controller;

import com.example.backend.dto.request.QuotaRequestDTO;
import com.example.backend.dto.response.QuotaResponseDTO;
import com.example.backend.service.QuotaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quotas")
@RequiredArgsConstructor
public class QuotaController {

    private final QuotaService quotaService;

    // GET /api/quotas/user/2/year/2026
    @GetMapping("/user/{userId}/year/{annee}")
    public ResponseEntity<QuotaResponseDTO> getQuota(@PathVariable Long userId, @PathVariable int annee) {
        return ResponseEntity.ok(quotaService.getByUserIdAndAnnee(userId, annee));
    }

    // PUT /api/quotas/1
    @PutMapping("/{id}")
    public ResponseEntity<QuotaResponseDTO> update(@PathVariable Long id, @Valid @RequestBody QuotaRequestDTO request) {
        return ResponseEntity.ok(quotaService.updateQuota(id, request));
    }
}