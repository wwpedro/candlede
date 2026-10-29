package com.store.candlede.repository;

import com.store.candlede.entity.InstitutionalContent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InstitutionalContentRepository
        extends JpaRepository<InstitutionalContent, Long> {

    Optional<InstitutionalContent> findByKey(String key);
    List<InstitutionalContent> findAllByOrderByKeyAsc();
    boolean existsByKey(String key);
}