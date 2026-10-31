-- Remove a trava antiga
ALTER TABLE orders DROP CONSTRAINT IF EXISTS ck_orders_status;

-- Cria a trava nova aceitando o COMPLETED
ALTER TABLE orders ADD CONSTRAINT ck_orders_status 
CHECK (status IN ('RECEIVED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'));