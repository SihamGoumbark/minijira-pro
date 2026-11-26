package com.minijira.backend.controller;

import com.minijira.backend.model.ActivityLog;
import com.minijira.backend.model.Project;
import com.minijira.backend.model.Task;
import com.minijira.backend.model.TaskComment;
import com.minijira.backend.repository.ActivityLogRepository;
import com.minijira.backend.repository.ProjectRepository;
import com.minijira.backend.repository.SprintRepository;
import com.minijira.backend.repository.TaskCommentRepository;
import com.minijira.backend.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final ActivityLogRepository activityLogRepository;
    private final TaskCommentRepository taskCommentRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/project/{projectId}")
    public List<Task> getTasksByProject(@PathVariable Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    @GetMapping("/project/{projectId}/activities")
    public List<ActivityLog> getProjectActivities(@PathVariable Long projectId) {
        return activityLogRepository.findTop20ByProjectIdOrderByTimestampDesc(projectId);
    }

    @PostMapping("/project/{projectId}")
    public ResponseEntity<Task> createTask(
            @PathVariable Long projectId,
            @RequestParam(required = false) Long sprintId,
            @RequestBody Task task) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (sprintId != null) {
            sprintRepository.findById(sprintId).ifPresent(task::setSprint);
        }
        if (task.getIssueType() == null) {
            task.setIssueType(Task.IssueType.TASK);
        }

        long count = taskRepository.findByProjectId(projectId).size() + 1;
        task.setTicketKey(project.getProjectKey() + "-" + count);
        task.setProject(project);

        Task saved = taskRepository.save(task);
        logAndBroadcast(projectId, "CREATED", "[" + saved.getIssueType() + "] " + saved.getTicketKey() + " créé : " + saved.getTitle());
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<Task> updateStatus(@PathVariable Long taskId, @RequestParam Task.TaskStatus status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Task.TaskStatus oldStatus = task.getStatus();
        task.setStatus(status);
        Task updated = taskRepository.save(task);

        String key = updated.getTicketKey() != null ? updated.getTicketKey() : "#" + updated.getId();
        logAndBroadcast(updated.getProject().getId(), "STATUS_CHANGED",
                "Ticket " + key + " déplacé de " + oldStatus + " vers " + status);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<Task> updateTask(@PathVariable Long taskId, @RequestBody Task incoming) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (incoming.getTitle() != null && !incoming.getTitle().isBlank()) {
            task.setTitle(incoming.getTitle());
        }
        task.setDescription(incoming.getDescription());
        if (incoming.getIssueType() != null) {
            task.setIssueType(incoming.getIssueType());
        }
        if (incoming.getStatus() != null) {
            task.setStatus(incoming.getStatus());
        }
        if (incoming.getPriority() != null) {
            task.setPriority(incoming.getPriority());
        }
        if (incoming.getStoryPoints() != null) {
            task.setStoryPoints(incoming.getStoryPoints());
        }
        task.setAssignee(incoming.getAssignee());

        Task updated = taskRepository.save(task);
        String key = updated.getTicketKey() != null ? updated.getTicketKey() : "#" + updated.getId();
        logAndBroadcast(updated.getProject().getId(), "UPDATED", "Ticket " + key + " mis à jour : " + updated.getTitle());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Long projectId = task.getProject().getId();
        String key = task.getTicketKey() != null ? task.getTicketKey() : "#" + task.getId();

        taskRepository.deleteById(taskId);
        logAndBroadcast(projectId, "DELETED", "Ticket " + key + " supprimé (" + task.getTitle() + ")");
        return ResponseEntity.noContent().build();
    }

    // Commentaires sur un ticket (Style Jira)
    @GetMapping("/{taskId}/comments")
    public List<TaskComment> getComments(@PathVariable Long taskId) {
        return taskCommentRepository.findByTaskIdOrderByCreatedAtAsc(taskId);
    }

    @PostMapping("/{taskId}/comments")
    public ResponseEntity<TaskComment> addComment(
            @PathVariable Long taskId,
            @RequestBody Map<String, String> payload) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        TaskComment comment = TaskComment.builder()
                .taskId(taskId)
                .authorName(payload.getOrDefault("authorName", "Utilisateur"))
                .content(payload.get("content"))
                .build();

        TaskComment saved = taskCommentRepository.save(comment);
        String key = task.getTicketKey() != null ? task.getTicketKey() : "#" + task.getId();
        logAndBroadcast(task.getProject().getId(), "COMMENTED",
                saved.getAuthorName() + " a commenté sur " + key);
        return ResponseEntity.ok(saved);
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