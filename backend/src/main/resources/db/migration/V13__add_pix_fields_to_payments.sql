ALTER TABLE payments
    ADD COLUMN qr_code TEXT,
    ADD COLUMN qr_code_text TEXT,
    ADD COLUMN ticket_url TEXT;