package com.example.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component // tells Spring to manage this class
public class JwtUtils {

    // reads values from application.properties
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private long jwtExpiration; // 15 minutes in ms

    @Value("${app.jwt.refresh-expiration}")
    private long refreshExpiration; // 7 days in ms

    // called at login → generates short-lived token (15 min)
    // stores the user's email inside the token
    public String generateAccessToken(String email) {
        return Jwts.builder()
                .subject(email)               // who this token belongs to
                .issuedAt(new Date())          // when it was created
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())     // signs it so nobody can fake it
                .compact();
    }

    // called at login → generates long-lived token (7 days)
    // same structure as access token but longer expiry
    public String generateRefreshToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    // called by JwtFilter on every request
    // reads the email stored inside the token
    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    // called by JwtFilter on every request
    // returns true if token is valid and not expired
    // returns false if token is expired or tampered with
    public boolean validateToken(String token) {
        try {
            getClaims(token); // throws exception if invalid
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // internal helper → reads the data inside the token
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // internal helper → converts your secret string into a key
    // the secret must be at least 32 characters
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
}