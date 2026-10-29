package com.store.candlede.repository;

import com.store.candlede.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<Category> findByActiveTrueOrderByNameAsc();
    
    List<Category> findAllByOrderByNameAsc();
    
    Optional<Category> findBySlug(String slug);

}