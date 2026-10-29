package com.store.candlede.repository;

import com.store.candlede.entity.AdminTwoFactorCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AdminTwoFactorCodeRepository extends JpaRepository<AdminTwoFactorCode, Long> {

    Optional<AdminTwoFactorCode> findTopByUserIdAndUsedFalseOrderByCreatedAtDesc(Long userId);

    @Modifying
    @Query("DELETE FROM AdminTwoFactorCode c WHERE c.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}