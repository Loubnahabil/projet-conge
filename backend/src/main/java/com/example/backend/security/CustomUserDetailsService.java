package com.example.backend.security;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    // Spring Security calls this automatically
    // receives the email extracted from the JWT token
    // must return a UserDetails object Spring Security understands
    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        // find user in DB by email
        // if not found → throw exception → Spring returns 401
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found: " + email));

        // convert your User entity into Spring Security's UserDetails
        // withUsername → who you are
        // password → for Spring to verify at login
        // authorities → your roles (ADMIN, FONCTIONNAIRE etc)
        // disabled → if account is disabled, Spring rejects the request
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority(role.getName()))
                        .collect(Collectors.toList()))
                .accountExpired(false)
                .credentialsExpired(false)
                .disabled(!user.getEnabled())
                .build();
    }
}