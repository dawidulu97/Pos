-- This script is for creating tables in Supabase.
-- It assumes you have already connected to your Supabase project.

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    image VARCHAR(255), -- Can store emoji or URL
    category VARCHAR(255) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    sku VARCHAR(255) UNIQUE
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) UNIQUE,
    address TEXT
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(255), -- Denormalized for easier reporting
    total_amount NUMERIC(10, 2) NOT NULL,
    total_discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_fees NUMERIC(10, 2) NOT NULL DEFAULT 0,
    amount_paid NUMERIC(10, 2) NOT NULL,
    change_due NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'completed', -- e.g., 'pending', 'completed', 'voided', 'refunded'
    notes TEXT,
    shipping_address TEXT,
    shipping_cost NUMERIC(10, 2) DEFAULT 0,
    delivery_provider_id UUID, -- Will link to delivery_providers table
    delivery_provider_name VARCHAR(255), -- Denormalized
    order_type VARCHAR(50) NOT NULL DEFAULT 'retail', -- 'retail', 'delivery', 'online'
    payment_status VARCHAR(50) NOT NULL DEFAULT 'paid', -- 'unpaid', 'paid', 'partially_refunded', 'refunded'
    voided_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    refund_reason TEXT,
    cash_drawer_start_amount NUMERIC(10, 2),
    cash_drawer_end_amount NUMERIC(10, 2),
    cash_in_amount NUMERIC(10, 2),
    cash_out_amount NUMERIC(10, 2),
    z_report_printed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table (junction table for orders and products)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL, -- Price at the time of sale
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0, -- Per-item discount percentage
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create delivery_providers table
CREATE TABLE IF NOT EXISTS delivery_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    default_fee NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- Create city_fees table for delivery providers
CREATE TABLE IF NOT EXISTS city_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES delivery_providers(id) ON DELETE CASCADE,
    city VARCHAR(255) NOT NULL,
    fee NUMERIC(10, 2) NOT NULL,
    UNIQUE (provider_id, city) -- Ensure unique city fee per provider
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_fees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (read-only for products, categories, delivery_providers)
-- For a real app, you'd want more granular policies based on user roles.

-- Products: Allow all users to read
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);
-- Products: Allow authenticated users to insert, update, delete
DROP POLICY IF EXISTS "Allow authenticated users to manage products" ON products;
CREATE POLICY "Allow authenticated users to manage products" ON products
FOR ALL
TO authenticated
USING (true) WITH CHECK (true);

-- Customers: Allow all users to read
DROP POLICY IF EXISTS "Allow public read access to customers" ON customers;
CREATE POLICY "Allow public read access to customers" ON customers FOR SELECT USING (true);
-- Customers: Allow authenticated users to insert, update, delete
DROP POLICY IF EXISTS "Allow authenticated users to manage customers" ON customers;
CREATE POLICY "Allow authenticated users to manage customers" ON customers
FOR ALL
TO authenticated
USING (true) WITH CHECK (true);

-- Orders: Allow all users to read
DROP POLICY IF EXISTS "Allow public read access to orders" ON orders;
CREATE POLICY "Allow public read access to orders" ON orders FOR SELECT USING (true);
-- Orders: Allow authenticated users to insert, update, delete
DROP POLICY IF EXISTS "Allow authenticated users to manage orders" ON orders;
CREATE POLICY "Allow authenticated users to manage orders" ON orders
FOR ALL
TO authenticated
USING (true) WITH CHECK (true);

-- Order Items: Allow all users to read
DROP POLICY IF EXISTS "Allow public read access to order_items" ON order_items;
CREATE POLICY "Allow public read access to order_items" ON order_items FOR SELECT USING (true);
-- Order Items: Allow authenticated users to insert, update, delete
DROP POLICY IF EXISTS "Allow authenticated users to manage order_items" ON order_items;
CREATE POLICY "Allow authenticated users to manage order_items" ON order_items
FOR ALL
TO authenticated
USING (true) WITH CHECK (true);

-- Categories: Allow all users to read
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (TRUE);
-- Categories: Allow authenticated users to insert, update, delete categories
-- For simplicity, let's assume 'service_role' can manage, and 'authenticated' can read.
-- You might need to adjust this based on your Supabase setup and user roles.
DROP POLICY IF EXISTS "Allow authenticated users to manage categories" ON categories;
CREATE POLICY "Allow authenticated users to manage categories" ON categories
FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role') WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Delivery Providers: Allow all users to read
DROP POLICY IF EXISTS "Allow public read access to delivery_providers" ON delivery_providers;
CREATE POLICY "Allow public read access to delivery_providers" ON delivery_providers FOR SELECT USING (true);
-- Delivery Providers: Allow authenticated users to insert, update, delete
DROP POLICY IF EXISTS "Allow authenticated users to manage delivery_providers" ON delivery_providers;
CREATE POLICY "Allow authenticated users to manage delivery_providers" ON delivery_providers
FOR ALL
TO authenticated
USING (true) WITH CHECK (true);

-- City Fees: Allow all users to read
DROP POLICY IF EXISTS "Allow public read access to city_fees" ON city_fees;
CREATE POLICY "Allow public read access to city_fees" ON city_fees FOR SELECT USING (true);
-- City Fees: Allow authenticated users to insert, update, delete
DROP POLICY IF EXISTS "Allow authenticated users to manage city_fees" ON city_fees;
CREATE POLICY "Allow authenticated users to manage city_fees" ON city_fees
FOR ALL
TO authenticated
USING (true) WITH CHECK (true);
