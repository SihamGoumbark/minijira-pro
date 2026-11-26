package com.minijira.backend;

import com.minijira.backend.controller.ProjectController;
import com.minijira.backend.model.Project;
import com.minijira.backend.repository.ProjectRepository;
import com.minijira.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectControllerTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ProjectController projectController;

    @BeforeEach
    void setUp() {
        lenient().when(authentication.getName()).thenReturn("owner@minijira.ma");
    }

    @Test
    void shouldCreateProjectWithOwnerEmail() {
        Project input = Project.builder()
                .name("Plateforme E-Commerce")
                .projectKey("ecom")
                .build();

        when(projectRepository.existsByProjectKey("ECOM")).thenReturn(false);
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<?> response = projectController.createProject(input, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Project saved = (Project) response.getBody();
        assertNotNull(saved);
        assertEquals("ECOM", saved.getProjectKey());
        assertEquals("owner@minijira.ma", saved.getOwnerEmail());
    }

    @Test
    void shouldRejectDuplicateProjectKey() {
        Project input = Project.builder()
                .name("Dupliqué")
                .projectKey("JIRA")
                .build();

        when(projectRepository.existsByProjectKey("JIRA")).thenReturn(true);

        ResponseEntity<?> response = projectController.createProject(input, authentication);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(projectRepository, never()).save(any());
    }

    @Test
    void shouldAllowOwnerToInviteRegisteredMember() {
        Project project = Project.builder()
                .id(10L)
                .name("Mini-Jira")
                .projectKey("MJP")
                .ownerEmail("owner@minijira.ma")
                .memberEmails(new HashSet<>())
                .build();

        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
        when(userRepository.existsByEmail("dev@minijira.ma")).thenReturn(true);
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<?> response = projectController.inviteMember(10L, "dev@minijira.ma", authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Project updated = (Project) response.getBody();
        assertNotNull(updated);
        assertTrue(updated.getMemberEmails().contains("dev@minijira.ma"));
    }
}
