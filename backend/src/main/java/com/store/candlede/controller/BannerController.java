package com.store.candlede.controller;

import com.store.candlede.dto.*;
import com.store.candlede.service.BannerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    @GetMapping("/banners")
    public List<BannerResponse> findAll() {
        return bannerService.findAllActive();
    }

    @GetMapping("/admin/banners")
    public List<BannerResponse> findAllForAdmin() {
        return bannerService.findAllForAdmin();
    }

    @PostMapping("/admin/banners")
    @ResponseStatus(HttpStatus.CREATED)
    public BannerResponse create(@Valid @RequestBody CreateBannerRequest request) {
        return bannerService.create(request);
    }

    @PutMapping("/admin/banners/{id}")
    public BannerResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBannerRequest request
    ) {
        return bannerService.update(id, request);
    }

    @PatchMapping("/admin/banners/{id}/deactivate")
    public void deactivate(@PathVariable Long id) {
        bannerService.deactivate(id);
    }

    @DeleteMapping("/admin/banners/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        bannerService.delete(id);
    }
}