package com.store.candlede.controller;

import com.store.candlede.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/uploads")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    // =========================================================
    // POST /api/admin/uploads/image
    // =========================================================
    @PostMapping("/image")
    public Map<String, String> uploadImage(
            @RequestParam("file") MultipartFile file
    ) {
        String url = fileStorageService.storeImage(file);
        return Map.of("url", url);
    }

    // =========================================================
    // POST /api/admin/uploads/video
    // =========================================================
    @PostMapping("/video")
    public Map<String, String> uploadVideo(
            @RequestParam("file") MultipartFile file
    ) {
        String url = fileStorageService.storeVideo(file);
        return Map.of("url", url);
    }
}