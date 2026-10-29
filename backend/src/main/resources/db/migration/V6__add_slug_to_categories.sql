ALTER TABLE categories
    ADD COLUMN slug VARCHAR(100);

ALTER TABLE categories
    ADD CONSTRAINT uk_categories_slug UNIQUE (slug);

CREATE INDEX idx_categories_slug ON categories(slug);