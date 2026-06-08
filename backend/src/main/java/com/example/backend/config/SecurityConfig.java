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

                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()


                        .requestMatchers(HttpMethod.PUT, "/demandes/*/soumettre").hasAuthority("FONCTIONNAIRE")
                        .requestMatchers(HttpMethod.PUT, "/demandes/*").hasAnyAuthority("FONCTIONNAIRE", "CHEF_HIERARCHIE", "SIGNATAIRE")
                        .requestMatchers(HttpMethod.PUT, "/demandes/*/visa-chef").hasAuthority("CHEF_HIERARCHIE")
                        .requestMatchers(HttpMethod.PUT, "/demandes/*/rejet-signataire").hasAuthority("SIGNATAIRE")
                        .requestMatchers("/demandes/a-viser").hasAuthority("CHEF_HIERARCHIE")
                        .requestMatchers("/demandes/a-signer").hasAuthority("SIGNATAIRE")
                        .requestMatchers("/demandes/my-requests").hasAnyAuthority("FONCTIONNAIRE", "CHEF_HIERARCHIE", "SIGNATAIRE")

                        .requestMatchers(HttpMethod.POST, "/demandes/*/upload").hasAnyAuthority("FONCTIONNAIRE", "SIGNATAIRE")


                        .requestMatchers(HttpMethod.GET,  "/users/me").authenticated()
                        .requestMatchers(HttpMethod.PUT,  "/users/me").authenticated()
                        .requestMatchers("/users/colleagues").hasAuthority("FONCTIONNAIRE")
                        .requestMatchers("/users/**").hasAuthority("ADMIN")

                        .requestMatchers("/statistiques/dashboard").hasAuthority("ADMIN")
                        .requestMatchers("/statistiques/fonctionnaire-dashboard").hasAuthority("FONCTIONNAIRE")
                        .requestMatchers("/statistiques/chef-dashboard").hasAuthority("CHEF_HIERARCHIE")
                        .requestMatchers("/statistiques/signataire-dashboard").hasAuthority("SIGNATAIRE")
                        .requestMatchers("/directions/**").hasAuthority("ADMIN")
                        .requestMatchers("/divisions/**").hasAuthority("ADMIN")
                        .requestMatchers("/services/**").hasAuthority("ADMIN")
                        .requestMatchers("/jours-feries/**").hasAuthority("ADMIN")
                        .requestMatchers("/admin/quotas/**").hasAuthority("ADMIN")
                        .requestMatchers("/demandes/audit").hasAuthority("ADMIN")
                        .requestMatchers("/demandes/all").hasAuthority("ADMIN")
                        .requestMatchers("/demandes/*/historique").hasAnyAuthority("ADMIN", "FONCTIONNAIRE", "CHEF_HIERARCHIE", "SIGNATAIRE")

                        .requestMatchers("/demandes/traitees-chef").hasAuthority("CHEF_HIERARCHIE")
                        .requestMatchers("/demandes/traitees-signataire").hasAuthority("SIGNATAIRE")
                        .requestMatchers("/demandes/*/generate-pdf").hasAuthority("SIGNATAIRE")

                        // Rule added right before the catch-all to allow authorized profiles to download documents
                        .requestMatchers(HttpMethod.GET, "/demandes/*/pieces/**").hasAnyAuthority("FONCTIONNAIRE", "CHEF_HIERARCHIE", "SIGNATAIRE", "ADMIN")

                        .requestMatchers("/demandes/**").hasAuthority("FONCTIONNAIRE")

                        .anyRequest().authenticated())

                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}