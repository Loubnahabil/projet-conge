package com.example.backend.controller;

import com.example.backend.dto.request.QuotaRequestDTO;
import com.example.backend.dto.response.QuotaResponseDTO;
import com.example.backend.service.QuotaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/quotas")
@RequiredArgsConstructor
public class QuotaController {

    private final QuotaService quotaService;

    // GET /api/quotas/user/2/year/2026
    @GetMapping("/user/{userId}/year/{annee}")
    public ResponseEntity<QuotaResponseDTO> getQuota(@PathVariable Long userId, @PathVariable int annee) {
        return ResponseEntity.ok(quotaService.getByUserIdAndAnnee(userId, annee));
    }

    // GET /api/quotas?year=2026&page=0&size=10
    @GetMapping
    public ResponseEntity<Page<QuotaResponseDTO>> getQuotasPage(
            @RequestParam int year,
            @PageableDefault(size = 10, sort = "nom", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(quotaService.getQuotasPage(year, pageable));
    }

    // PUT /api/quotas/1
    @PutMapping("/{id}")
    public ResponseEntity<QuotaResponseDTO> update(@PathVariable Long id, @Valid @RequestBody QuotaRequestDTO request) {
        return ResponseEntity.ok(quotaService.updateQuota(id, request));
    }
}
