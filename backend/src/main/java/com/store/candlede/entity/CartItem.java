package com.store.candlede.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "cart_items",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_cart_items_cart_product",
            columnNames = {"cart_id", "product_id"}
        )
    },
    indexes = {
        @Index(
            name = "idx_cart_items_cart",
            columnList = "cart_id"
        ),
        @Index(
            name = "idx_cart_items_product",
            columnList = "product_id"
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "cart_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_cart_items_cart")
    )
    @ToString.Exclude
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "product_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_cart_items_product")
    )
    private Product product;

    @Column(nullable = false)
    private Integer quantity;
}