package com.store.candlede.service;

import com.store.candlede.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.url:http://localhost:8081/uploads}")
    private String uploadUrl;

    private static final Set<String> ALLOWED_IMAGE =
            Set.of("jpg", "jpeg", "png", "webp", "gif");

    private static final Set<String> ALLOWED_VIDEO =
            Set.of("mp4", "webm", "mov", "m4v", "ogg");

    // =========================================================
    // IMAGEM
    // =========================================================
    public String storeImage(MultipartFile file) {
        return store(file, ALLOWED_IMAGE,
                "Formato de imagem não permitido. Use JPG, PNG, WEBP ou GIF.");
    }

    // =========================================================
    // VÍDEO
    // =========================================================
    public String storeVideo(MultipartFile file) {
        return store(file, ALLOWED_VIDEO,
                "Formato de vídeo não permitido. Use MP4, WEBM ou MOV.");
    }

    // =========================================================
    // MÉTODO INTERNO
    // =========================================================
    private String store(MultipartFile file, Set<String> allowed, String errorMessage) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Arquivo vazio.");
        }

        String original = file.getOriginalFilename();
        if (original == null || !original.contains(".")) {
            throw new BusinessException("Arquivo sem extensão.");
        }

        String ext = original.substring(original.lastIndexOf('.') + 1).toLowerCase();
        if (!allowed.contains(ext)) {
            throw new BusinessException(errorMessage);
        }

        try {
            Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dir);

            String filename = UUID.randomUUID().toString().replace("-", "") + "." + ext;
            Path target = dir.resolve(filename);

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return uploadUrl + "/" + filename;
        } catch (IOException e) {
            throw new BusinessException("Erro ao salvar arquivo: " + e.getMessage());
        }
    }
}