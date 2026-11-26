package com.minijira.backend.controller;

import com.minijira.backend.model.Project;
import com.minijira.backend.repository.ProjectRepository;
import com.minijira.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<Project> getMyProjects(Authentication authentication) {
        return projectRepository.findAccessibleProjects(authentication.getName());
    }

    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody Project project, Authentication authentication) {
        if (projectRepository.existsByProjectKey(project.getProjectKey().toUpperCase())) {
            return ResponseEntity.badRequest().body("Cette clé de projet existe déjà.");
        }
        project.setProjectKey(project.getProjectKey().toUpperCase());
        project.setOwnerEmail(authentication.getName());
        return ResponseEntity.ok(projectRepository.save(project));
    }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<?> inviteMember(
            @PathVariable Long projectId,
            @RequestParam String email,
            Authentication authentication) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));

        if (!project.getOwnerEmail().equals(authentication.getName())) {
            return ResponseEntity.status(403).body(Map.of("message", "Seul le propriétaire peut inviter des membres."));
        }

        if (!userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Aucun utilisateur inscrit avec cet email."));
        }

        project.getMemberEmails().add(email.trim().toLowerCase());
        return ResponseEntity.ok(projectRepository.save(project));
    }
}