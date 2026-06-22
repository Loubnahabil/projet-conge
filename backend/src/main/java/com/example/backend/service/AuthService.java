package com.example.backend.service;

import com.example.backend.dto.request.LoginRequestDTO;
import com.example.backend.dto.response.LoginResponseDTO;
import com.example.backend.entity.RefreshToken;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.exception.BusinessException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.RefreshTokenRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtUtils;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final LoginAttemptService loginAttemptService;
    private final EntityManager entityManager;


    @Value("${app.jwt.refresh-expiration}")
    private long refreshExpiration;

    @Transactional
    public LoginResponseDTO login(LoginRequestDTO request) {
        log.info("Tentative connexion - email={}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user != null) {
            loginAttemptService.checkAndResetIfExpired(user);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            if (user != null) {
                loginAttemptService.registerFailedAttempt(user);
            }
            throw e;
        }

        loginAttemptService.resetAttempts(user);

        String accessToken = jwtUtils.generateAccessToken(user.getEmail());
        String refreshTokenStr = jwtUtils.generateRefreshToken(user.getEmail());

        refreshTokenRepository.deleteByUser(user);
        entityManager.flush();

        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenStr)
                .user(user)
                .expiresAt(Instant.now().plusMillis(refreshExpiration))
                .build();
        refreshTokenRepository.save(refreshToken);

        String role = user.getRoles().stream()
                .findFirst()
                .map(Role::getName)
                .orElse("");

        log.info("Connexion réussie - email={} role={}", request.getEmail(), role);

        return LoginResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .role(role)
                .build();
    }

    @Transactional
    public LoginResponseDTO refresh(String refreshTokenStr) {
        RefreshToken stored = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new BusinessException("Refresh token invalide", ErrorCode.REFRESH_TOKEN_INVALID));

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(stored);
            throw new BusinessException("Refresh token expiré", ErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        User user = stored.getUser();
        String newAccessToken = jwtUtils.generateAccessToken(user.getEmail());
        String newRefreshToken = jwtUtils.generateRefreshToken(user.getEmail());

        // rotate: delete all existing and flush before inserting new one
        refreshTokenRepository.deleteByUser(user);
        entityManager.flush();
        RefreshToken newStored = RefreshToken.builder()
                .token(newRefreshToken)
                .user(user)
                .expiresAt(Instant.now().plusMillis(refreshExpiration))
                .build();
        refreshTokenRepository.save(newStored);

        String role = user.getRoles().stream().findFirst().map(Role::getName).orElse("");

        return LoginResponseDTO.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .role(role)
                .build();
    }
    @Transactional
    public void logout(String email) {
        log.info("Déconnexion - email={}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        refreshTokenRepository.deleteByUser(user);
    }
}