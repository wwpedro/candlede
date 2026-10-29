package com.store.candlede.service;

import com.store.candlede.dto.ContentResponse;
import com.store.candlede.dto.UpdateContentRequest;
import com.store.candlede.entity.InstitutionalContent;
import com.store.candlede.exception.ResourceNotFoundException;
import com.store.candlede.repository.InstitutionalContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final InstitutionalContentRepository repo;
    private final AuditService auditService;

    public List<ContentResponse> findAll() {
        return repo.findAllByOrderByKeyAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ContentResponse findByKey(String key) {
        InstitutionalContent c = repo.findByKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Conteúdo não encontrado."));
        return toResponse(c);
    }

    @Transactional
    public ContentResponse update(String key, UpdateContentRequest req) {
        InstitutionalContent c = repo.findByKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Conteúdo não encontrado."));

        c.setTitle(req.title().trim());
        c.setContent(req.content());
        if (req.active() != null) {
            c.setActive(req.active());
        }
        repo.save(c);

        // ===== AUDITORIA =====
        auditService.log(
                "CONTENT_UPDATE",
                "InstitutionalContent",
                c.getId(),
                "Atualizou texto '" + key + "': " + c.getTitle()
        );

        return toResponse(c);
    }

    private ContentResponse toResponse(InstitutionalContent c) {
        return new ContentResponse(
                c.getId(),
                c.getKey(),
                c.getTitle(),
                c.getContent(),
                c.getActive()
        );
    }
}