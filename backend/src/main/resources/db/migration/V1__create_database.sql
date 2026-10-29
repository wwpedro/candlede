-- ============================================================
-- V1 - BANCO COMPLETO DA LOJA
-- PostgreSQL
-- ============================================================


-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    email VARCHAR(150) NOT NULL,

    password VARCHAR(255) NOT NULL,

    phone VARCHAR(20),

    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_users_email
        UNIQUE (email),

    CONSTRAINT ck_users_role
        CHECK (
            role IN ('CUSTOMER', 'ADMIN')
        )
);


-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    description TEXT,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_categories_name
        UNIQUE (name)
);


-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    description TEXT,

    price NUMERIC(10,2) NOT NULL,

    image_url TEXT,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    category_id BIGINT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id),

    CONSTRAINT ck_products_price
        CHECK (price >= 0)
);


-- ============================================================
-- INVENTORIES
-- ============================================================

CREATE TABLE inventories (
    id BIGSERIAL PRIMARY KEY,

    product_id BIGINT NOT NULL,

    quantity INTEGER NOT NULL DEFAULT 0,

    minimum_quantity INTEGER NOT NULL DEFAULT 5,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_inventories_product
        UNIQUE (product_id),

    CONSTRAINT fk_inventories_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT ck_inventories_quantity
        CHECK (quantity >= 0),

    CONSTRAINT ck_inventories_minimum_quantity
        CHECK (minimum_quantity >= 0)
);


-- ============================================================
-- ADDRESSES
-- ============================================================

CREATE TABLE addresses (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    cep VARCHAR(10) NOT NULL,

    street VARCHAR(150) NOT NULL,

    number VARCHAR(20) NOT NULL,

    complement VARCHAR(100),

    neighborhood VARCHAR(100) NOT NULL,

    city VARCHAR(100) NOT NULL,

    state VARCHAR(2) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_addresses_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================================
-- CARTS
-- ============================================================

CREATE TABLE carts (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_carts_user
        UNIQUE (user_id),

    CONSTRAINT fk_carts_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================================
-- CART ITEMS
-- ============================================================

CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,

    cart_id BIGINT NOT NULL,

    product_id BIGINT NOT NULL,

    quantity INTEGER NOT NULL,

    CONSTRAINT uk_cart_items_cart_product
        UNIQUE (cart_id, product_id),

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id)
        REFERENCES carts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cart_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id),

    CONSTRAINT ck_cart_items_quantity
        CHECK (quantity > 0)
);


-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    customer_name VARCHAR(150) NOT NULL,

    customer_email VARCHAR(150) NOT NULL,

    customer_phone VARCHAR(20),

    subtotal NUMERIC(10,2) NOT NULL,

    shipping_price NUMERIC(10,2) NOT NULL DEFAULT 0,

    total NUMERIC(10,2) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'RECEIVED',

    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    payment_method VARCHAR(20) NOT NULL,

    cep VARCHAR(10) NOT NULL,

    street VARCHAR(150) NOT NULL,

    number VARCHAR(20) NOT NULL,

    complement VARCHAR(100),

    neighborhood VARCHAR(100) NOT NULL,

    city VARCHAR(100) NOT NULL,

    state VARCHAR(2) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT ck_orders_subtotal
        CHECK (subtotal >= 0),

    CONSTRAINT ck_orders_shipping
        CHECK (shipping_price >= 0),

    CONSTRAINT ck_orders_total
        CHECK (total >= 0),

    CONSTRAINT ck_orders_status
        CHECK (
            status IN (
                'RECEIVED',
                'PREPARING',
                'SHIPPED',
                'DELIVERED',
                'CANCELLED'
            )
        ),

    CONSTRAINT ck_orders_payment_status
        CHECK (
            payment_status IN (
                'PENDING',
                'APPROVED',
                'REFUSED',
                'CANCELLED'
            )
        ),

    CONSTRAINT ck_orders_payment_method
        CHECK (
            payment_method IN (
                'PIX',
                'CREDIT_CARD',
                'DEBIT_CARD'
            )
        )
);


-- ============================================================
-- ORDER ITEMS
-- ============================================================

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,

    order_id BIGINT NOT NULL,

    product_id BIGINT NOT NULL,

    product_name VARCHAR(150) NOT NULL,

    quantity INTEGER NOT NULL,

    unit_price NUMERIC(10,2) NOT NULL,

    subtotal NUMERIC(10,2) NOT NULL,

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id),

    CONSTRAINT ck_order_items_quantity
        CHECK (quantity > 0),

    CONSTRAINT ck_order_items_unit_price
        CHECK (unit_price >= 0),

    CONSTRAINT ck_order_items_subtotal
        CHECK (subtotal >= 0)
);


-- ============================================================
-- STOCK MOVEMENTS
-- ============================================================

CREATE TABLE stock_movements (
    id BIGSERIAL PRIMARY KEY,

    inventory_id BIGINT NOT NULL,

    order_id BIGINT,

    movement_type VARCHAR(20) NOT NULL,

    quantity INTEGER NOT NULL,

    previous_quantity INTEGER NOT NULL,

    new_quantity INTEGER NOT NULL,

    reason VARCHAR(255),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_stock_movements_inventory
        FOREIGN KEY (inventory_id)
        REFERENCES inventories(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_stock_movements_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE SET NULL,

    CONSTRAINT ck_stock_movements_type
        CHECK (
            movement_type IN (
                'ENTRY',
                'SALE',
                'ADJUSTMENT',
                'RETURN'
            )
        ),

    CONSTRAINT ck_stock_movements_quantity
        CHECK (quantity > 0),

    CONSTRAINT ck_stock_movements_previous_quantity
        CHECK (previous_quantity >= 0),

    CONSTRAINT ck_stock_movements_new_quantity
        CHECK (new_quantity >= 0)
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_products_name
    ON products(name);

CREATE INDEX idx_products_category
    ON products(category_id);

CREATE INDEX idx_products_active
    ON products(active);

CREATE INDEX idx_addresses_user
    ON addresses(user_id);

CREATE INDEX idx_cart_items_cart
    ON cart_items(cart_id);

CREATE INDEX idx_cart_items_product
    ON cart_items(product_id);

CREATE INDEX idx_orders_user
    ON orders(user_id);

CREATE INDEX idx_orders_status
    ON orders(status);

CREATE INDEX idx_orders_created_at
    ON orders(created_at);

CREATE INDEX idx_orders_customer_email
    ON orders(customer_email);

CREATE INDEX idx_order_items_order
    ON order_items(order_id);

CREATE INDEX idx_order_items_product
    ON order_items(product_id);

CREATE INDEX idx_stock_movements_inventory
    ON stock_movements(inventory_id);

CREATE INDEX idx_stock_movements_order
    ON stock_movements(order_id);

CREATE INDEX idx_stock_movements_created_at
    ON stock_movements(created_at);