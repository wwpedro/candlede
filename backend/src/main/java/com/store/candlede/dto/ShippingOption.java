package com.store.candlede.dto;

import java.math.BigDecimal;

public record ShippingOption(
	    String name,
	    String company,
	    BigDecimal price,
	    Integer deliveryTime
) {}
