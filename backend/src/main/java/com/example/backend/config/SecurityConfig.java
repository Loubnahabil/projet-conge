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
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:5174"));
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

                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()


                        .requestMatchers(HttpMethod.PUT, "/api/demandes/*/soumettre").hasAuthority("FONCTIONNAIRE")
                        .requestMatchers(HttpMethod.PUT, "/api/demandes/*").hasAnyAuthority("FONCTIONNAIRE", "CHEF_HIERARCHIE", "SIGNATAIRE")
                        .requestMatchers(HttpMethod.PUT, "/api/demandes/*/visa-chef").hasAuthority("CHEF_HIERARCHIE")
                        .requestMatchers(HttpMethod.PUT, "/api/demandes/*/rejet-signataire").hasAuthority("SIGNATAIRE")
                        .requestMatchers("/api/demandes/a-viser").hasAuthority("CHEF_HIERARCHIE")
                        .requestMatchers("/api/demandes/a-signer").hasAuthority("SIGNATAIRE")
                        .requestMatchers("/api/demandes/my-requests").hasAnyAuthority("FONCTIONNAIRE", "CHEF_HIERARCHIE", "SIGNATAIRE")

                        .requestMatchers(HttpMethod.POST, "/api/demandes/*/upload").hasAnyAuthority("FONCTIONNAIRE", "SIGNATAIRE")


                        .requestMatchers(HttpMethod.GET,  "/api/users/me").authenticated()
                        .requestMatchers(HttpMethod.PUT,  "/api/users/me").authenticated()
                        .requestMatchers("/api/users/colleagues").hasAuthority("FONCTIONNAIRE")
                        .requestMatchers("/api/users/**").hasAuthority("ADMIN")

                        .requestMatchers("/api/statistiques/dashboard").hasAuthority("ADMIN")
                        .requestMatchers("/api/statistiques/fonctionnaire-dashboard").hasAuthority("FONCTIONNAIRE")
                        .requestMatchers("/api/statistiques/chef-dashboard").hasAuthority("CHEF_HIERARCHIE")
                        .requestMatchers("/api/statistiques/signataire-dashboard").hasAuthority("SIGNATAIRE")
                        .requestMatchers("/api/directions/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/divisions/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/services/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/jours-feries/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/admin/quotas/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/demandes/audit").hasAuthority("ADMIN")
                        .requestMatchers("/api/demandes/all").hasAuthority("ADMIN")
                        .requestMatchers("/api/demandes/*/historique").hasAnyAuthority("ADMIN", "FONCTIONNAIRE", "CHEF_HIERARCHIE", "SIGNATAIRE")

                        .requestMatchers("/api/demandes/traitees-chef").hasAuthority("CHEF_HIERARCHIE")
                        .requestMatchers("/api/demandes/traitees-signataire").hasAuthority("SIGNATAIRE")
                        .requestMatchers("/api/demandes/*/generate-pdf").hasAuthority("SIGNATAIRE")

                        // Rule added right before the catch-all to allow authorized profiles to download documents
                        .requestMatchers(HttpMethod.GET, "/api/demandes/*/pieces/**").hasAnyAuthority("FONCTIONNAIRE", "CHEF_HIERARCHIE", "SIGNATAIRE", "ADMIN")

                        .requestMatchers("/api/demandes/**").hasAuthority("FONCTIONNAIRE")

                        .anyRequest().authenticated())

                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}