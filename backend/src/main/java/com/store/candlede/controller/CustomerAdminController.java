package com.store.candlede.controller;

import com.store.candlede.dto.CustomerDetailResponse;
import com.store.candlede.dto.CustomerResponse;
import com.store.candlede.service.CustomerAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
public class CustomerAdminController {

    private final CustomerAdminService customerAdminService;

    @GetMapping
    public List<CustomerResponse> findAll() {
        return customerAdminService.findAll();
    }

    @GetMapping("/{id}")
    public CustomerDetailResponse findById(@PathVariable Long id) {
        return customerAdminService.findById(id);
    }
}