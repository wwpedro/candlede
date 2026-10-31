package com.store.candlede.entity;

import com.store.candlede.enums.OrderStatus;
import com.store.candlede.enums.PaymentMethod;
import com.store.candlede.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "orders",
    indexes = {
        @Index(
            name = "idx_orders_user",
            columnList = "user_id"
        ),
        @Index(
            name = "idx_orders_status",
            columnList = "status"
        ),
        @Index(
            name = "idx_orders_created_at",
            columnList = "created_at"
        ),
        @Index(
            name = "idx_orders_customer_email",
            columnList = "customer_email"
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Pode ser null porque o cliente pode comprar
     * como visitante.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "user_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_orders_user")
    )
    @ToString.Exclude
    private User user;

    /*
     * Snapshot dos dados do cliente no momento da compra.
     */
    @Column(
        name = "customer_name",
        nullable = false,
        length = 150
    )
    private String customerName;

    @Column(
        name = "customer_email",
        nullable = false,
        length = 150
    )
    private String customerEmail;
    
    @Column(name = "delivery_confirmed_at")
    private LocalDateTime deliveryConfirmedAt;

    @Column(
        name = "customer_phone",
        length = 20
    )
    private String customerPhone;

    /*
     * Valores financeiros
     */
    @Column(
        nullable = false,
        precision = 10,
        scale = 2
    )
    private BigDecimal subtotal;

    @Column(
        name = "shipping_price",
        nullable = false,
        precision = 10,
        scale = 2
    )
    private BigDecimal shippingPrice;

    @Column(
        nullable = false,
        precision = 10,
        scale = 2
    )
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false,
        length = 20
    )
    @Builder.Default
    private OrderStatus status = OrderStatus.RECEIVED;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "payment_status",
        nullable = false,
        length = 20
    )
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "payment_method",
        nullable = false,
        length = 20
    )
    private PaymentMethod paymentMethod;

    /*
     * Snapshot do endereço usado na entrega.
     */
    @Column(nullable = false, length = 10)
    private String cep;

    @Column(nullable = false, length = 150)
    private String street;

    @Column(nullable = false, length = 20)
    private String number;

    @Column(length = 100)
    private String complement;

    @Column(nullable = false, length = 100)
    private String neighborhood;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 2)
    private String state;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(
        mappedBy = "order",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    @Builder.Default
    @ToString.Exclude
    private List<OrderItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}