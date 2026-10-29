package com.store.candlede.controller;

import com.store.candlede.dto.ContactMessageResponse;
import com.store.candlede.dto.CreateContactMessageRequest;
import com.store.candlede.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    // =========================================================
    // PÚBLICO — enviar mensagem
    // =========================================================
    @PostMapping("/contact")
    @ResponseStatus(HttpStatus.CREATED)
    public ContactMessageResponse create(
            @Valid @RequestBody CreateContactMessageRequest request
    ) {
        return contactService.create(request);
    }

    // =========================================================
    // ADMIN
    // =========================================================
    @GetMapping("/admin/contact-messages")
    public List<ContactMessageResponse> listAll() {
        return contactService.findAll();
    }

    @GetMapping("/admin/contact-messages/unread-count")
    public long unreadCount() {
        return contactService.countUnread();
    }

    @PatchMapping("/admin/contact-messages/{id}/read")
    public void markRead(@PathVariable Long id) {
        contactService.markAsRead(id);
    }

    @DeleteMapping("/admin/contact-messages/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        contactService.delete(id);
    }
}