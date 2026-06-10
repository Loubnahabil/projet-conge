package com.example.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(1)
@Slf4j
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        long start = System.currentTimeMillis();
        String user = extractUser();

        MDC.put("user", user);

        try {
            chain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - start;
            String uri = request.getRequestURI();
            String qs = request.getQueryString();

            String maskedQueryString = (qs != null && !qs.isEmpty())
                    ? "?" + qs.replaceAll("(?i)(password|token|secret|jwt)=[^&]+", "$1=****")
                    : "";

            if (response.getStatus() >= 500) {
                log.error("{} {}{} -> {} ({}ms)", request.getMethod(), uri, maskedQueryString, response.getStatus(), duration);
            } else if (response.getStatus() >= 400) {
                log.warn("{} {}{} -> {} ({}ms)", request.getMethod(), uri, maskedQueryString, response.getStatus(), duration);
            } else {
                log.info("{} {}{} -> {} ({}ms)", request.getMethod(), uri, maskedQueryString, response.getStatus(), duration);
            }

            MDC.remove("user");
        }
    }

    private String extractUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()
                && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return "ANONYMOUS";
    }
}
