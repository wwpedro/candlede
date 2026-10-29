package com.store.candlede.entity;

import com.store.candlede.enums.StockMovementType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "stock_movements",
    indexes = {
        @Index(
            name = "idx_stock_movements_inventory",
            columnList = "inventory_id"
        ),
        @Index(
            name = "idx_stock_movements_order",
            columnList = "order_id"
        ),
        @Index(
            name = "idx_stock_movements_created_at",
            columnList = "created_at"
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "inventory_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_stock_movements_inventory")
    )
    @ToString.Exclude
    private Inventory inventory;

    /*
     * Pode ser nulo porque nem toda movimentação
     * necessariamente vem de um pedido.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "order_id",
        foreignKey = @ForeignKey(name = "fk_stock_movements_order")
    )
    @ToString.Exclude
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "movement_type",
        nullable = false,
        length = 20
    )
    private StockMovementType movementType;

    @Column(nullable = false)
    private Integer quantity;

    @Column(
        name = "previous_quantity",
        nullable = false
    )
    private Integer previousQuantity;

    @Column(
        name = "new_quantity",
        nullable = false
    )
    private Integer newQuantity;

    @Column(length = 255)
    private String reason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}