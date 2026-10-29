package com.store.candlede.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
    name = "order_items",
    indexes = {
        @Index(
            name = "idx_order_items_order",
            columnList = "order_id"
        ),
        @Index(
            name = "idx_order_items_product",
            columnList = "product_id"
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "order_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_order_items_order")
    )
    @ToString.Exclude
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "product_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_order_items_product")
    )
    private Product product;

    /*
     * Snapshot do produto no momento da compra.
     */
    @Column(
        name = "product_name",
        nullable = false,
        length = 150
    )
    private String productName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(
        name = "unit_price",
        nullable = false,
        precision = 10,
        scale = 2
    )
    private BigDecimal unitPrice;

    @Column(
        nullable = false,
        precision = 10,
        scale = 2
    )
    private BigDecimal subtotal;
}