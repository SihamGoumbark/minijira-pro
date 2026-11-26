package com.minijira.backend.controller;

import com.minijira.backend.model.User;
import com.minijira.backend.repository.UserRepository;
import com.minijira.backend.security.JwtService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cet email est déjà utilisé."));
        }

        User.Role assignedRole = "ADMIN".equalsIgnoreCase(request.getRole())
                ? User.Role.ADMIN
                : User.Role.DEVELOPER;

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .build();

        userRepository.save(user);
        String token = jwtService.generateToken(user, user.getRole().name(), user.getFullName());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        String token = jwtService.generateToken(user, user.getRole().name(), user.getFullName());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
        ));
    }

    @Data
    public static class RegisterRequest {
        private String fullName;
        private String email;
        private String password;
        private String role; // ADMIN ou DEVELOPER
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }
}