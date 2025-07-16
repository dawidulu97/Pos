-- Add 'shipping_address', 'shipping_cost', 'delivery_provider_id', 'delivery_provider_name', 'shipping_city', 'order_type' to 'orders'
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='shipping_address') THEN
        ALTER TABLE orders ADD COLUMN shipping_address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='shipping_cost') THEN
        ALTER TABLE orders ADD COLUMN shipping_cost NUMERIC(10, 2) DEFAULT 0.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivery_provider_id') THEN
        ALTER TABLE orders ADD COLUMN delivery_provider_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivery_provider_name') THEN
        ALTER TABLE orders ADD COLUMN delivery_provider_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='shipping_city') THEN
        ALTER TABLE orders ADD COLUMN shipping_city TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='order_type') THEN
        ALTER TABLE orders ADD COLUMN order_type TEXT DEFAULT 'retail'; -- 'retail' or 'delivery'
    END IF;
END
$$;

-- Create delivery_providers table if it doesn't exist
CREATE TABLE IF NOT EXISTS delivery_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL UNIQUE,
  contact_info TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Add foreign key constraint to orders table for delivery_provider_id
DO $$
BEGIN
    -- Check if the column exists and if the constraint does not exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivery_provider_id') AND
       NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_delivery_provider_id_fkey') THEN
        ALTER TABLE orders
        ADD CONSTRAINT orders_delivery_provider_id_fkey
        FOREIGN KEY (delivery_provider_id) REFERENCES delivery_providers(id);
    END IF;
END
$$;

-- Add shipping-related columns to the `orders` table
ALTER TABLE orders
ADD COLUMN shipping_address TEXT,
ADD COLUMN shipping_cost NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN delivery_provider_id UUID,
ADD COLUMN delivery_provider_name TEXT,
ADD COLUMN shipping_city TEXT,
ADD COLUMN order_type TEXT DEFAULT 'retail'; -- 'retail' or 'delivery'

-- Add `shipping_enabled` to `settings` table
ALTER TABLE settings
ADD COLUMN shipping_enabled BOOLEAN DEFAULT FALSE;

-- Add `delivery_providers` (JSONB) to `settings` table
ALTER TABLE settings
ADD COLUMN delivery_providers JSONB DEFAULT '[]';

-- Update existing settings to include new fields if they don't exist
UPDATE settings
SET
  shipping_enabled = COALESCE(shipping_enabled, FALSE),
  delivery_providers = COALESCE(delivery_providers, '[]'::jsonb)
WHERE
  id IS NOT NULL; -- Ensures it applies to existing settings row(s)

-- Seed some initial delivery providers (optional, for testing)
INSERT INTO delivery_providers (name, contact_info, is_active) VALUES
('Speedy Deliveries', 'info@speedy.com', TRUE),
('QuickShip Logistics', 'support@quickship.com', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Update existing orders to set default values for new columns if they are NULL
UPDATE orders SET
    shipping_address = COALESCE(shipping_address, ''),
    shipping_cost = COALESCE(shipping_cost, 0.00),
    delivery_provider_id = COALESCE(delivery_provider_id, NULL),
    delivery_provider_name = COALESCE(delivery_provider_name, ''),
    shipping_city = COALESCE(shipping_city, ''),
    order_type = COALESCE(order_type, 'retail')
WHERE shipping_address IS NULL OR shipping_cost IS NULL OR delivery_provider_id IS NULL OR delivery_provider_name IS NULL OR shipping_city IS NULL OR order_type IS NULL;
