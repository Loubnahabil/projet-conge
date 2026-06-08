package com.example.backend.controller;

import com.example.backend.dto.request.LoginRequestDTO;
import com.example.backend.dto.response.LoginResponseDTO;
import com.example.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/user/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(Map.of("email", userDetails.getUsername()));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Map<String, String>> logout(
            @AuthenticationPrincipal UserDetails userDetails) {
        authService.logout(userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Déconnexion réussie"));
    }
    @PostMapping("/auth/refresh")
    public ResponseEntity<LoginResponseDTO> refresh(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.refresh(body.get("refreshToken")));
    }

}