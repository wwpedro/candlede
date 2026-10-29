package com.store.candlede.service;

import com.store.candlede.dto.CustomerDetailResponse;
import com.store.candlede.dto.CustomerResponse;
import com.store.candlede.dto.OrderResponse;
import com.store.candlede.entity.User;
import com.store.candlede.enums.Role;
import com.store.candlede.exception.ResourceNotFoundException;
import com.store.candlede.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerAdminService {

    private final UserRepository userRepository;
    private final OrderService orderService;

    public List<CustomerResponse> findAll() {
        return userRepository.findByRoleOrderByCreatedAtDesc(Role.CUSTOMER)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CustomerDetailResponse findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado."));

        if (user.getRole() != Role.CUSTOMER) {
            throw new ResourceNotFoundException("Cliente não encontrado.");
        }

        List<OrderResponse> orders = orderService.findByUser(user.getId());

        return new CustomerDetailResponse(toResponse(user), orders);
    }

    private CustomerResponse toResponse(User u) {
        return new CustomerResponse(
            u.getId(),
            u.getName(),
            u.getEmail(),
            u.getPhone(),
            u.getActive(),
            u.getCreatedAt()
        );
    }
}