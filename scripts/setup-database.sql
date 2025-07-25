-- This script sets up the initial database schema for the POS system.

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    image TEXT,
    category TEXT,
    stock INTEGER DEFAULT 0,
    sku TEXT UNIQUE
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES customers(id),
    customer_name TEXT, -- Denormalized for easier reporting
    total_amount NUMERIC(10, 2) NOT NULL,
    total_discount NUMERIC(10, 2) DEFAULT 0,
    total_fees NUMERIC(10, 2) DEFAULT 0,
    amount_paid NUMERIC(10, 2) NOT NULL,
    change_due NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed', -- e.g., 'completed', 'pending', 'voided', 'refunded'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    shipping_address TEXT,
    shipping_cost NUMERIC(10, 2) DEFAULT 0,
    delivery_provider_id TEXT, -- Will be a foreign key to delivery_providers table
    delivery_provider_name TEXT, -- Denormalized
    order_type TEXT DEFAULT 'retail', -- 'retail' or 'delivery'
    payment_status TEXT DEFAULT 'paid', -- 'paid', 'partially_paid', 'unpaid', 'refunded'
    voided_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_reason TEXT,
    cash_drawer_start_amount NUMERIC(10, 2),
    cash_drawer_end_amount NUMERIC(10, 2),
    cash_in_amount NUMERIC(10, 2),
    cash_out_amount NUMERIC(10, 2),
    z_report_printed_at TIMESTAMP WITH TIME ZONE
);

-- Create order_items table (junction table for orders and products)
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL, -- Price at the time of sale
    discount NUMERIC(10, 2) DEFAULT 0, -- Discount applied to this item
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a default "Guest" customer if not exists
INSERT INTO customers (id, name, email, phone, address)
VALUES ('00000000-0000-0000-0000-000000000001', 'Guest', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Seed some initial products if the table is empty
INSERT INTO products (id, name, price, image, category, stock, sku) VALUES
('prod_001', 'Espresso Machine', 350.00, '☕', 'Coffee Equipment', 10, 'ESPMCH001'),
('prod_002', 'Bag of Coffee Beans (250g)', 15.00, '🫘', 'Coffee Beans', 50, 'COFBNS001'),
('prod_003', 'Ceramic Mug', 12.50, '컵', 'Merchandise', 100, 'MUGCRM001'),
('prod_004', 'Latte Art Pitcher', 25.00, '🥛', 'Coffee Equipment', 20, 'LATPCH001'),
('prod_005', 'Digital Coffee Scale', 45.00, '⚖️', 'Coffee Equipment', 15, 'COFSCAL001'),
('prod_006', 'French Press (Small)', 30.00, '☕', 'Coffee Equipment', 25, 'FRNPRS001'),
('prod_007', 'Aeropress', 32.00, '☕', 'Coffee Equipment', 18, 'AERPRS001'),
('prod_008', 'Cold Brew Maker', 40.00, '🧊', 'Coffee Equipment', 12, 'CLDBRW001'),
('prod_009', 'Reusable Coffee Cup', 18.00, '🥤', 'Merchandise', 70, 'REUCUP001'),
('prod_010', 'Coffee Grinder (Manual)', 55.00, '⚙️', 'Coffee Equipment', 10, 'COFGRN001')
ON CONFLICT (id) DO NOTHING;
