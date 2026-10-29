package com.store.candlede.service;

import com.store.candlede.dto.*;
import com.store.candlede.entity.Banner;
import com.store.candlede.exception.ResourceNotFoundException;
import com.store.candlede.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;
    private final AuditService auditService;

    public List<BannerResponse> findAllActive() {
        return bannerRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream().map(this::toResponse).toList();
    }

    public List<BannerResponse> findAllForAdmin() {
        return bannerRepository.findAllByOrderByDisplayOrderAsc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public BannerResponse create(CreateBannerRequest req) {
        Banner b = Banner.builder()
                .title(req.title().trim())
                .subtitle(req.subtitle())
                .imageUrl(req.imageUrl())
                .buttonText(req.buttonText())
                .buttonLink(req.buttonLink())
                .displayOrder(req.displayOrder())
                .active(true)
                .build();
        bannerRepository.save(b);

        // ===== AUDITORIA =====
        auditService.log(
                "BANNER_CREATE",
                "Banner",
                b.getId(),
                "Criou banner: " + b.getTitle()
        );

        return toResponse(b);
    }

    @Transactional
    public BannerResponse update(Long id, UpdateBannerRequest req) {
        Banner b = findEntity(id);
        b.setTitle(req.title().trim());
        b.setSubtitle(req.subtitle());
        b.setImageUrl(req.imageUrl());
        b.setButtonText(req.buttonText());
        b.setButtonLink(req.buttonLink());
        b.setDisplayOrder(req.displayOrder());
        if (req.active() != null) b.setActive(req.active());
        bannerRepository.save(b);

        // ===== AUDITORIA =====
        auditService.log(
                "BANNER_UPDATE",
                "Banner",
                b.getId(),
                "Atualizou banner: " + b.getTitle()
        );

        return toResponse(b);
    }

    @Transactional
    public void deactivate(Long id) {
        Banner b = findEntity(id);
        b.setActive(false);
        bannerRepository.save(b);

        // ===== AUDITORIA =====
        auditService.log(
                "BANNER_DEACTIVATE",
                "Banner",
                b.getId(),
                "Desativou banner: " + b.getTitle()
        );
    }

    @Transactional
    public void delete(Long id) {
        Banner b = findEntity(id);
        String title = b.getTitle();
        bannerRepository.delete(b);

        // ===== AUDITORIA =====
        auditService.log(
                "BANNER_DELETE",
                "Banner",
                id,
                "Excluiu banner: " + title
        );
    }

    private Banner findEntity(Long id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner não encontrado."));
    }

    private BannerResponse toResponse(Banner b) {
        return new BannerResponse(
                b.getId(), b.getTitle(), b.getSubtitle(),
                b.getImageUrl(), b.getButtonText(), b.getButtonLink(),
                b.getDisplayOrder(), b.getActive()
        );
    }
}