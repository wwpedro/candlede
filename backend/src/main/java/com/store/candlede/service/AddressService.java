package com.store.candlede.service;

import com.store.candlede.dto.CreateAddressRequest;
import com.store.candlede.dto.UpdateAddressRequest;
import com.store.candlede.dto.AddressResponse;
import com.store.candlede.entity.Address;
import com.store.candlede.entity.User;
import com.store.candlede.exception.ResourceNotFoundException;
import com.store.candlede.repository.AddressRepository;
import com.store.candlede.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<AddressResponse> findByUser(Long userId) {

        return addressRepository
                .findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AddressResponse create(
            Long userId,
            CreateAddressRequest request
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Usuário não encontrado."
                        )
                );

        Address address = Address.builder()
                .user(user)
                .cep(request.cep())
                .street(request.street())
                .number(request.number())
                .complement(request.complement())
                .neighborhood(request.neighborhood())
                .city(request.city())
                .state(request.state().toUpperCase())
                .build();

        addressRepository.save(address);

        return toResponse(address);
    }

    @Transactional
    public AddressResponse update(
            Long userId,
            Long addressId,
            UpdateAddressRequest request
    ) {

        Address address = addressRepository
                .findByIdAndUserId(addressId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Endereço não encontrado."
                        )
                );

        address.setCep(request.cep());
        address.setStreet(request.street());
        address.setNumber(request.number());
        address.setComplement(request.complement());
        address.setNeighborhood(request.neighborhood());
        address.setCity(request.city());
        address.setState(request.state().toUpperCase());

        addressRepository.save(address);

        return toResponse(address);
    }

    @Transactional
    public void delete(
            Long userId,
            Long addressId
    ) {

        Address address = addressRepository
                .findByIdAndUserId(addressId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Endereço não encontrado."
                        )
                );

        addressRepository.delete(address);
    }

    private AddressResponse toResponse(Address address) {

        return new AddressResponse(
                address.getId(),
                address.getCep(),
                address.getStreet(),
                address.getNumber(),
                address.getComplement(),
                address.getNeighborhood(),
                address.getCity(),
                address.getState()
        );
    }
}
