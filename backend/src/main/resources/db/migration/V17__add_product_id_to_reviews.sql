-- Adiciona a coluna product_id se ela ainda não existir
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS product_id BIGINT;

-- Cria a chave estrangeira ligando à tabela de produtos (se ainda não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'fk_reviews_product'
    ) THEN
        ALTER TABLE reviews 
        ADD CONSTRAINT fk_reviews_product 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    END IF;
END $$;