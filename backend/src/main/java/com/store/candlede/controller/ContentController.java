package com.store.candlede.controller;

import com.store.candlede.dto.ContentResponse;
import com.store.candlede.dto.UpdateContentRequest;
import com.store.candlede.service.ContentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    // ---------- PÚBLICO ----------
    @GetMapping("/content/{key}")
    public ContentResponse findByKey(@PathVariable String key) {
        return contentService.findByKey(key);
    }

    // ---------- ADMIN ----------
    @GetMapping("/admin/content")
    public List<ContentResponse> findAll() {
        return contentService.findAll();
    }

    @PutMapping("/admin/content/{key}")
    public ContentResponse update(
            @PathVariable String key,
            @Valid @RequestBody UpdateContentRequest request
    ) {
        return contentService.update(key, request);
    }
}