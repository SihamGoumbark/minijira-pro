package com.minijira.backend.controller;

import com.minijira.backend.model.ActivityLog;
import com.minijira.backend.model.Project;
import com.minijira.backend.model.Sprint;
import com.minijira.backend.model.Task;
import com.minijira.backend.repository.ActivityLogRepository;
import com.minijira.backend.repository.ProjectRepository;
import com.minijira.backend.repository.SprintRepository;
import com.minijira.backend.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/agile")
@RequiredArgsConstructor
public class SprintAndAnalyticsController {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ActivityLogRepository activityLogRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // 1. Lister les Sprints d'un projet
    @GetMapping("/projects/{projectId}/sprints")
    public List<Sprint> getSprints(@PathVariable Long projectId) {
        return sprintRepository.findByProjectIdOrderByIdAsc(projectId);
    }

    // 2. Créer un Sprint
    @PostMapping("/projects/{projectId}/sprints")
    public ResponseEntity<Sprint> createSprint(@PathVariable Long projectId, @RequestBody Sprint sprint) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        sprint.setProject(project);
        Sprint saved = sprintRepository.save(sprint);

        logAndBroadcast(projectId, "CREATED", "Sprint créé : " + saved.getName());
        return ResponseEntity.ok(saved);
    }

    // 3. Démarrer / Clôturer un Sprint
    @PatchMapping("/sprints/{sprintId}/status")
    public ResponseEntity<Sprint> updateSprintStatus(@PathVariable Long sprintId, @RequestParam Sprint.SprintStatus status) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint not found"));
        sprint.setStatus(status);
        Sprint updated = sprintRepository.save(sprint);

        logAndBroadcast(updated.getProject().getId(), "STATUS_CHANGED",
                "Sprint " + updated.getName() + " passé en " + status);
        return ResponseEntity.ok(updated);
    }

    // 4. Affecter un ticket à un Sprint (ou null pour le Backlog)
    @PatchMapping("/tasks/{taskId}/sprint")
    public ResponseEntity<Task> assignTaskToSprint(@PathVariable Long taskId, @RequestParam(required = false) Long sprintId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (sprintId == null) {
            task.setSprint(null);
        } else {
            Sprint sprint = sprintRepository.findById(sprintId)
                    .orElseThrow(() -> new RuntimeException("Sprint not found"));
            task.setSprint(sprint);
        }
        Task saved = taskRepository.save(task);
        String target = saved.getSprint() != null ? saved.getSprint().getName() : "Backlog";
        logAndBroadcast(saved.getProject().getId(), "STATUS_CHANGED",
                "Ticket " + saved.getTicketKey() + " affecté à : " + target);
        return ResponseEntity.ok(saved);
    }

    // 5. Endpoint Dashboard Analytics (KPIs & Graphiques)
    @GetMapping("/projects/{projectId}/analytics")
    public Map<String, Object> getProjectAnalytics(@PathVariable Long projectId) {
        List<Task> tasks = taskRepository.findByProjectId(projectId);

        int totalTasks = tasks.size();
        long doneTasks = tasks.stream().filter(t -> t.getStatus() == Task.TaskStatus.DONE).count();
        int totalPoints = tasks.stream().mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0).sum();
        int completedPoints = tasks.stream()
                .filter(t -> t.getStatus() == Task.TaskStatus.DONE)
                .mapToInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                .sum();

        // Répartition par statut
        Map<String, Long> byStatus = tasks.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting()));

        // Répartition par priorité
        Map<String, Long> byPriority = tasks.stream()
                .collect(Collectors.groupingBy(t -> t.getPriority().name(), Collectors.counting()));

        // Charge (Story Points) par développeur
        Map<String, Integer> workloadByAssignee = tasks.stream()
                .collect(Collectors.groupingBy(
                        t -> (t.getAssignee() == null || t.getAssignee().isBlank()) ? "Non assigné" : t.getAssignee(),
                        Collectors.summingInt(t -> t.getStoryPoints() != null ? t.getStoryPoints() : 0)
                ));

        Map<String, Object> result = new HashMap<>();
        result.put("totalTasks", totalTasks);
        result.put("doneTasks", doneTasks);
        result.put("totalPoints", totalPoints);
        result.put("completedPoints", completedPoints);
        result.put("byStatus", byStatus);
        result.put("byPriority", byPriority);
        result.put("workloadByAssignee", workloadByAssignee);
        return result;
    }

    private void logAndBroadcast(Long projectId, String action, String details) {
        activityLogRepository.save(ActivityLog.builder()
                .projectId(projectId)
                .action(action)
                .details(details)
                .build());
        messagingTemplate.convertAndSend("/topic/projects/" + projectId, action);
    }
}