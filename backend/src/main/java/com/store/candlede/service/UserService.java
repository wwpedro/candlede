package com.store.candlede.service;

import com.store.candlede.dto.UpdateUserRequest;
import com.store.candlede.dto.UserResponse;
import com.store.candlede.entity.User;
import com.store.candlede.exception.ResourceNotFoundException;
import com.store.candlede.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getEntityById(Long userId) {

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Usuário não encontrado."
                        )
                );
    }

    public User getEntityByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Usuário não encontrado."
                        )
                );
    }

    public UserResponse getById(Long userId) {

        User user = getEntityById(userId);

        return toResponse(user);
    }

    @Transactional
    public UserResponse update(
            Long userId,
            UpdateUserRequest request
    ) {

        User user = getEntityById(userId);

        user.setName(request.name());
        user.setPhone(request.phone());

        userRepository.save(user);

        return toResponse(user);
    }

    private UserResponse toResponse(User user) {

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.getActive()
        );
    }
}