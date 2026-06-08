package com.example.backend.controller;

import com.example.backend.dto.response.ChefDashboardResponseDTO;
import com.example.backend.dto.response.DashboardStatsResponseDTO;
import com.example.backend.dto.response.FonctionnaireDashboardResponseDTO;
import com.example.backend.dto.response.SignataireDashboardResponseDTO;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.service.StatistiquesService;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/statistiques")
@RequiredArgsConstructor
public class StatistiquesController {

    private final StatistiquesService statistiquesService;
    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponseDTO> getDashboard() {
        return ResponseEntity.ok(statistiquesService.getDashboardStats());
    }

    @GetMapping("/fonctionnaire-dashboard")
    public ResponseEntity<FonctionnaireDashboardResponseDTO> getFonctionnaireDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(statistiquesService.getFonctionnaireDashboard(userId));
    }

    @GetMapping("/chef-dashboard")
    public ResponseEntity<ChefDashboardResponseDTO> getChefDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long chefId = getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(statistiquesService.getChefDashboard(chefId));
    }

    @GetMapping("/signataire-dashboard")
    public ResponseEntity<SignataireDashboardResponseDTO> getSignataireDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long signataireId = getAuthenticatedUserId(userDetails);
        return ResponseEntity.ok(statistiquesService.getSignataireDashboard(signataireId));
    }

    private Long getAuthenticatedUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur connecté introuvable"))
                .getId();
    }
}
