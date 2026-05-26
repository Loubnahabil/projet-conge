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
    // Secured to ADMIN only via Spring Security config (see note below)
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponseDTO> getDashboard() {
        return ResponseEntity.ok(statistiquesService.getDashboardStats());
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: Add this line to your SecurityConfig's http.authorizeHttpRequests()
// so only ADMIN can hit this endpoint:
//
//   .requestMatchers("/api/statistiques/**").hasRole("ADMIN")
//
// Or if your roles are stored without "ROLE_" prefix use hasAuthority instead:
//   .requestMatchers("/api/statistiques/**").hasAuthority("ADMIN")
// ─────────────────────────────────────────────────────────────────────────────