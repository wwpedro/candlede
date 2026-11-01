package com.store.candlede.service;

import com.store.candlede.exception.BusinessException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    // ADICIONADO OS DOIS PONTOS (:) NO FINAL DE CADA UM PARA NÃO QUEBRAR NO LOCALHOST
    @Value("${supabase.s3.endpoint:}")
    private String s3Endpoint;

    @Value("${supabase.s3.region:us-east-1}")
    private String s3Region;

    @Value("${supabase.s3.access-key:}")
    private String s3AccessKey;

    @Value("${supabase.s3.secret-key:}")
    private String s3SecretKey;

    @Value("${supabase.s3.bucket:produtos}")
    private String s3Bucket;

    private S3Client s3Client;

    private static final Set<String> ALLOWED_IMAGE =
            Set.of("jpg", "jpeg", "png", "webp", "gif");

    private static final Set<String> ALLOWED_VIDEO =
            Set.of("mp4", "webm", "mov", "m4v", "ogg");

    @PostConstruct
    public void init() {
        if (s3Endpoint == null || s3Endpoint.isBlank()) {
            System.out.println("[STORAGE] ⚠️ Variáveis do Supabase S3 não encontradas. Uploads desativados neste ambiente (localhost).");
            return;
        }

        try {
            s3Client = S3Client.builder()
                    .endpointOverride(URI.create(s3Endpoint))
                    .region(Region.of(s3Region))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(s3AccessKey, s3SecretKey)
                    ))
                    .forcePathStyle(true)
                    .build();
            System.out.println("[STORAGE] ✅ Cliente S3 do Supabase conectado com sucesso.");
        } catch (Exception e) {
            System.out.println("[STORAGE] ❌ Erro ao conectar no S3: " + e.getMessage());
        }
    }

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
    // MÉTODO INTERNO (Faz o upload real)
    // =========================================================
    private String store(MultipartFile file, Set<String> allowed, String errorMessage) {
       if (s3Client == null) {
            throw new BusinessException("O serviço de imagens está desativado no ambiente local.");
        }

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
            String filename = UUID.randomUUID().toString().replace("-", "") + "." + ext;

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(s3Bucket)
                    .key(filename)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return s3Endpoint.replace("/s3", "") + "/object/public/" + s3Bucket + "/" + filename;
            
        } catch (IOException e) {
            throw new BusinessException("Erro ao salvar arquivo: " + e.getMessage());
        }
    }
}