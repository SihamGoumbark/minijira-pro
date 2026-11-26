package com.minijira.backend.repository;

import com.minijira.backend.model.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, Long> {
    List<Sprint> findByProjectIdOrderByIdAsc(Long projectId);
}
