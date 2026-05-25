package com.example.backend.controller;

import com.example.backend.dto.request.CreateUserRequestDTO;
import com.example.backend.dto.request.UpdateUserRequestDTO;
import com.example.backend.dto.response.UserResponseDTO;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/users?search=ali&page=0&size=10
    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                userService.getAll(search, page, size));
    }

    // GET /api/users/colleagues
    // This literal string route MUST sit above the /{id} route!
    @GetMapping("/colleagues")
    public ResponseEntity<List<UserResponseDTO>> getSameServiceColleagues(
            @AuthenticationPrincipal UserDetails userDetails) {
        String currentEmail = userDetails.getUsername();
        return ResponseEntity.ok(userService.getColleaguesFromSameService(currentEmail));
    }

    // GET /api/users/1
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    // POST /api/users
    @PostMapping
    public ResponseEntity<UserResponseDTO> create(
            @Valid @RequestBody CreateUserRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.create(request));
    }

    // PUT /api/users/1
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequestDTO request) {
        return ResponseEntity.ok(
                userService.update(id, request));
    }

    // PATCH /api/users/1/toggle
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<UserResponseDTO> toggle(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                userService.toggleEnabled(id));
    }

    // DELETE /api/users/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}