package com.minijira.backend.repository;

import com.minijira.backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    boolean existsByProjectKey(String projectKey);

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.memberEmails m WHERE p.ownerEmail = :email OR m = :email ORDER BY p.id ASC")
    List<Project> findAccessibleProjects(@Param("email") String email);
}