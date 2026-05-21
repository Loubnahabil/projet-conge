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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/fonctionnaires?search=ali&page=0&size=10
    @GetMapping
    //@PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<UserResponseDTO>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                userService.getAll(search, page, size));
    }

    // GET /api/fonctionnaires/1
    @GetMapping("/{id}")
    //@PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserResponseDTO> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    // POST /api/fonctionnaires
    @PostMapping
    //@PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserResponseDTO> create(
            @Valid @RequestBody CreateUserRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.create(request));
    }

    // PUT /api/fonctionnaires/1
    @PutMapping("/{id}")
    //@PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequestDTO request) {
        return ResponseEntity.ok(
                userService.update(id, request));
    }

    // PATCH /api/fonctionnaires/1/toggle
    @PatchMapping("/{id}/toggle")
    //@PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserResponseDTO> toggle(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                userService.toggleEnabled(id));
    }

    // DELETE /api/fonctionnaires/1
    @DeleteMapping("/{id}")
    //@PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}