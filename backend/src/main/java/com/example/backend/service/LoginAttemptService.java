package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.exception.AccountLockedException;
import com.example.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginAttemptService {

    private final UserRepository userRepository;

    @Value("${app.login.max-attempts}")
    private int maxAttempts;

    @Value("${app.login.lock-duration-minutes}")
    private int lockDurationMinutes;

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void checkAndResetIfExpired(User user) {
        if (user.getLockTime() == null) return;

        long elapsedMinutes = Duration.between(user.getLockTime(), Instant.now()).toMinutes();
        if (elapsedMinutes < lockDurationMinutes) {
            long remaining = lockDurationMinutes - elapsedMinutes;
            throw new AccountLockedException(
                    "Compte temporairement verrouillé. Réessayez dans " + remaining + " minute(s).");
        }

        user.setFailedAttempts(0);
        user.setLockTime(null);
        userRepository.save(user);
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void registerFailedAttempt(User user) {
        user.setFailedAttempts(user.getFailedAttempts() + 1);
        if (user.getFailedAttempts() >= maxAttempts) {
            user.setLockTime(Instant.now());
            log.warn("Compte verrouillé - email={} après {} échecs", user.getEmail(), maxAttempts);
        }
        userRepository.save(user);
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void resetAttempts(User user) {
        if (user.getFailedAttempts() > 0 || user.getLockTime() != null) {
            user.setFailedAttempts(0);
            user.setLockTime(null);
            userRepository.save(user);
        }
    }
}
