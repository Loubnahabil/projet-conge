package com.example.backend.config;

import com.example.backend.security.CustomUserDetailsService;
import com.example.backend.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Collections.singletonList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // 1. Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()

                        // 2. Specific Workflow & Queue Queries
                        .requestMatchers(HttpMethod.PUT, "/api/demandes/*/visa-chef").hasAuthority("CHEF_HIERARCHIE")
                        .requestMatchers(HttpMethod.PUT, "/api/demandes/*/rejet-signataire").hasAuthority("SIGNATAIRE")
                        .requestMatchers("/api/demandes/a-viser").hasAuthority("CHEF_HIERARCHIE")
                        .requestMatchers("/api/demandes/a-signer").hasAuthority("SIGNATAIRE")
                        .requestMatchers("/api/demandes/my-requests").hasAnyAuthority("FONCTIONNAIRE", "CHEF_HIERARCHIE", "SIGNATAIRE")

                        // ✅ FIX: Explicitly grant access to both profiles for uploads before hitting the catch-all
                        .requestMatchers(HttpMethod.POST, "/api/demandes/*/upload").hasAnyAuthority("FONCTIONNAIRE", "SIGNATAIRE")

                        // 3. Catch-all for Demandes lifecycle requests - FONCTIONNAIRE only
                        .requestMatchers("/api/demandes/**").hasAuthority("FONCTIONNAIRE")

                        // 4. User Profiles & Context boundaries
                        .requestMatchers("/api/users/colleagues").hasAuthority("FONCTIONNAIRE")
                        .requestMatchers("/api/users/**").hasAuthority("ADMIN")

                        // 5. Structural/Config rules - ADMIN only
                        .requestMatchers("/api/statistiques/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/directions/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/divisions/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/services/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/jours-feries/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/admin/quotas/**").hasAuthority("ADMIN")

                        // Everything else requires authentication
                        .anyRequest().authenticated())

                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}