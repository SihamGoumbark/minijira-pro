package com.minijira.backend;

import com.minijira.backend.model.User;
import com.minijira.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        testUser = User.builder()
                .id(1L)
                .fullName("Sara Bennani")
                .email("sara@minijira.ma")
                .password("encodedPassword123")
                .role(User.Role.ADMIN)
                .build();
    }

    @Test
    void shouldGenerateAndValidateJwtToken() {
        String token = jwtService.generateToken(testUser, "ADMIN", "Sara Bennani");

        assertNotNull(token);
        assertEquals("sara@minijira.ma", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, testUser));
    }

    @Test
    void shouldRejectTokenForDifferentUser() {
        String token = jwtService.generateToken(testUser, "ADMIN", "Sara Bennani");

        User otherUser = User.builder()
                .email("autre@minijira.ma")
                .password("pass")
                .role(User.Role.DEVELOPER)
                .build();

        assertFalse(jwtService.isTokenValid(token, otherUser));
    }
}