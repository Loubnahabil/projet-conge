package com.example.backend.controller;

import com.example.backend.dto.response.DashboardStatsResponseDTO;
import com.example.backend.service.StatistiquesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistiques")
@RequiredArgsConstructor
public class StatistiquesController {

    private final StatistiquesService statistiquesService;

    // GET /api/statistiques/dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponseDTO> getDashboard() {
        return ResponseEntity.ok(statistiquesService.getDashboardStats());
    }
}


