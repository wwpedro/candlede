// CustomerDetailResponse.java
package com.store.candlede.dto;

import java.util.List;

public record CustomerDetailResponse(
    CustomerResponse customer,
    List<OrderResponse> orders
) {}