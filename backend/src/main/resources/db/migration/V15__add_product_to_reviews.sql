ALTER TABLE reviews ADD COLUMN product_id BIGINT;
ALTER TABLE reviews ADD CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;