package com.example.backend.config;

import com.example.backend.config.RouteProperties.RouteRule;
import com.example.backend.security.JwtFilter;
import com.example.backend.security.RequestLoggingFilter;
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
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final RequestLoggingFilter requestLoggingFilter;
    private final RouteProperties routeProperties;

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
                .authorizeHttpRequests(auth -> {
                    for (String url : routeProperties.getPublicUrls()) {
                        auth.requestMatchers(url).permitAll();
                    }
                    for (RouteRule rule : routeProperties.getAllRules()) {
                        String pattern = rule.getPattern();
                        String methodStr = rule.getMethod();
                        List<String> roles = rule.getRoles();

                        boolean isAuthenticated = roles != null && roles.size() == 1
                                && "AUTHENTICATED".equalsIgnoreCase(roles.get(0));

                        var matcher = (methodStr != null && !"ANY".equalsIgnoreCase(methodStr))
                                ? auth.requestMatchers(HttpMethod.valueOf(methodStr.toUpperCase()), pattern)
                                : auth.requestMatchers(pattern);

                        if (isAuthenticated) {
                            matcher.authenticated();
                        } else if (roles != null && !roles.isEmpty()) {
                            if (roles.size() == 1) {
                                matcher.hasAuthority(roles.get(0));
                            } else {
                                matcher.hasAnyAuthority(roles.toArray(String[]::new));
                            }
                        } else {
                            matcher.authenticated();
                        }
                    }
                    auth.anyRequest().authenticated();
                })
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(requestLoggingFilter, JwtFilter.class);

        return http.build();
    }
}
