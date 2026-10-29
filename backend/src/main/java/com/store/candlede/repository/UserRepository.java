package com.store.candlede.repository;

import com.store.candlede.entity.User;
import com.store.candlede.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // ---------- ADICIONADO ----------
    List<User> findByRoleOrderByCreatedAtDesc(Role role);
}