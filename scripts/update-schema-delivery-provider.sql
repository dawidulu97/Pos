-- This script updates the database schema to include delivery provider information.

-- Create delivery_providers table if it doesn't exist
CREATE TABLE IF NOT EXISTS delivery_providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    contact_phone TEXT,
    contact_email TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add delivery_provider_id and delivery_provider_name columns to the orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_provider_id TEXT REFERENCES delivery_providers(id),
ADD COLUMN IF NOT EXISTS delivery_provider_name TEXT;

-- Seed some initial delivery providers if the table is empty
INSERT INTO delivery_providers (id, name, contact_phone, contact_email, is_active) VALUES
('dp_aramex', 'Aramex', '+96265358888', 'info@aramex.com', TRUE),
('dp_dhl', 'DHL Express', '+96265606060', 'support@dhl.com', TRUE),
('dp_fedex', 'FedEx', '+96265800000', 'service@fedex.com', TRUE),
('dp_jordan_post', 'Jordan Post', '+96264625221', 'info@jordanpost.com.jo', TRUE)
ON CONFLICT (id) DO NOTHING;
