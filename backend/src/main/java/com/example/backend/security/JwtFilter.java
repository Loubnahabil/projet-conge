package com.example.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
// OncePerRequestFilter = runs exactly once per request, never twice
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // read the Authorization header from the request
        // it looks like: "Bearer eyJ...ABC"
        String authHeader = request.getHeader("Authorization");

        // if header exists and starts with "Bearer "
        // extract the token part (remove "Bearer " prefix)
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // removes "Bearer "

            // validate the token using JwtUtils
            if (jwtUtils.validateToken(token)) {

                // extract email from inside the token
                String email = jwtUtils.extractEmail(token);

                // load full user details from DB
                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(email);

                // create authentication object
                // this is what Spring Security stores as "current logged in user"
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null, // no credentials needed here
                                userDetails.getAuthorities()); // roles

                // attach request details to the authentication
                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request));

                // tell Spring Security: this user is authenticated
                // from this point, any @PreAuthorize check will work
                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);
            }
            // if token invalid → we don't set authentication
            // Spring Security will block protected endpoints automatically
        }

        // always continue to next filter regardless
        filterChain.doFilter(request, response);
    }
}