-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS delivery_providers CASCADE;
DROP TABLE IF EXISTS city_fees CASCADE;

-- Create categories table
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories if they don't exist
INSERT INTO categories (id, name)
VALUES
    ('cat_surface', 'Surface'),
    ('cat_accessories', 'Accessories'),
    ('cat_laptops', 'Laptops'),
    ('cat_desktops', 'Desktops'),
    ('cat_monitors', 'Monitors'),
    ('cat_peripherals', 'Peripherals'),
    ('cat_software', 'Software'),
    ('cat_services', 'Services'),
    ('cat_coffee_equipment', 'Coffee Equipment'),
    ('cat_coffee_beans', 'Coffee Beans'),
    ('cat_merchandise', 'Merchandise'),
    ('cat_drinks', 'Drinks'),
    ('cat_food', 'Food'),
    ('cat_uncategorized', 'Uncategorized')
ON CONFLICT (id) DO NOTHING;

-- Create products table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image VARCHAR(10) DEFAULT '📦',
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  sku VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing products to have a category_id if they don't already
-- This assumes 'category' column in 'products' table exists and contains category names
-- You might need to adjust this based on your actual data and desired mapping
UPDATE products
SET category_id =
    CASE
        WHEN category_id = 'Surface' THEN 'cat_surface'
        WHEN category_id = 'Accessories' THEN 'cat_accessories'
        WHEN category_id = 'Laptops' THEN 'cat_laptops'
        WHEN category_id = 'Desktops' THEN 'cat_desktops'
        WHEN category_id = 'Monitors' THEN 'cat_monitors'
        WHEN category_id = 'Peripherals' THEN 'cat_peripherals'
        WHEN category_id = 'Software' THEN 'cat_software'
        WHEN category_id = 'Services' THEN 'cat_services'
        WHEN category_id = 'Coffee Equipment' THEN 'cat_coffee_equipment'
        WHEN category_id = 'Coffee Beans' THEN 'cat_coffee_beans'
        WHEN category_id = 'Merchandise' THEN 'cat_merchandise'
        WHEN category_id = 'Drinks' THEN 'cat_drinks'
        WHEN category_id = 'Food' THEN 'cat_food'
        ELSE 'cat_uncategorized' -- Default category for existing products without a match
    END
WHERE category_id IS NOT NULL;

-- Ensure all products have a category. If a product's category is NULL or doesn't match
-- an existing category, assign it to 'Uncategorized'.
UPDATE products
SET category_id = 'cat_uncategorized'
WHERE category_id IS NULL OR category_id NOT IN (SELECT id FROM categories);

-- Create customers table
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create delivery_providers table
CREATE TABLE delivery_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    default_fee NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- Create city_fees table for delivery providers
CREATE TABLE city_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES delivery_providers(id) ON DELETE CASCADE,
    city VARCHAR(255) NOT NULL,
    fee NUMERIC(10, 2) NOT NULL
);

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  tax DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  notes TEXT,
  shipping_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivery_provider_id UUID REFERENCES delivery_providers(id) ON DELETE SET NULL
);

-- Insert sample customers first
INSERT INTO customers (id, name, email, phone, address) VALUES
('00000000-0000-0000-0000-000000000001', 'Guest', '', '', ''),
('00000000-0000-0000-0000-000000000002', 'John Smith', 'john@example.com', '123-456-7890', '123 Main St'),
('00000000-0000-0000-0000-000000000003', 'Sarah Johnson', 'sarah@example.com', '098-765-4321', '456 Oak Ave');

-- Insert sample products
INSERT INTO products (name, price, image, category_id, stock, sku) VALUES
('Apples', 0.87, '🍎', 'cat_food', 50, 'FRUIT-001'),
('Bananas', 0.87, '🍌', 'cat_food', 30, 'FRUIT-002'),
('Strawberries', 1.00, '🍓', 'cat_food', 25, 'FRUIT-003'),
('Baguette', 2.50, '🥖', 'cat_food', 8, 'BAKERY-001'),
('Carrots', 0.65, '🥕', 'cat_food', 40, 'VEG-001'),
('Tomatoes', 1.20, '🍅', 'cat_food', 35, 'VEG-002'),
('Milk', 1.85, '🥛', 'cat_food', 20, 'DAIRY-001'),
('Cheese', 3.50, '🧀', 'cat_food', 15, 'DAIRY-002'),
('Chicken Breast', 5.99, '🐔', 'cat_food', 12, 'MEAT-001'),
('Orange Juice', 2.25, '🍊', 'cat_food', 18, 'BEV-001');

-- Insert default delivery providers and their city-specific fees
INSERT INTO delivery_providers (name, default_fee)
VALUES
    ('Local Delivery', 5.00),
    ('Express Courier', 15.00)
ON CONFLICT (name) DO NOTHING;

-- Insert city fees for Local Delivery
INSERT INTO city_fees (provider_id, city, fee)
SELECT id, 'Baghdad', 7.50 FROM delivery_providers WHERE name = 'Local Delivery'
ON CONFLICT DO NOTHING;

INSERT INTO city_fees (provider_id, city, fee)
SELECT id, 'Basra', 8.00 FROM delivery_providers WHERE name = 'Local Delivery'
ON CONFLICT DO NOTHING;

-- Insert city fees for Express Courier
INSERT INTO city_fees (provider_id, city, fee)
SELECT id, 'Erbil', 20.00 FROM delivery_providers WHERE name = 'Express Courier'
ON CONFLICT DO NOTHING;

INSERT INTO city_fees (provider_id, city, fee)
SELECT id, 'Duhok', 22.00 FROM delivery_providers WHERE name = 'Express Courier'
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_delivery_providers_name ON delivery_providers(name);
CREATE INDEX idx_city_fees_provider_id ON city_fees(provider_id);
CREATE INDEX idx_city_fees_city ON city_fees(city);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_fees ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
-- Products policies
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON products FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON products FOR DELETE USING (true);

-- Customers policies
CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON customers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON customers FOR DELETE USING (true);

-- Orders policies
CREATE POLICY "Enable read access for all users" ON orders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON orders FOR DELETE USING (true);

-- Categories policies
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON categories FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON categories FOR DELETE USING (true);

-- Delivery Providers policies
CREATE POLICY "Enable read access for all users" ON delivery_providers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON delivery_providers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON delivery_providers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON delivery_providers FOR DELETE USING (true);

-- City Fees policies
CREATE POLICY "Enable read access for all users" ON city_fees FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON city_fees FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON city_fees FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON city_fees FOR DELETE USING (true);

-- Insert a sample order for testing
INSERT INTO orders (customer_id, customer_name, items, subtotal, tax, total, payment_method, status, notes, delivery_provider_id) VALUES
('00000000-0000-0000-0000-000000000002', 'John Smith', 
'[{"id": "1", "name": "Apples", "price": 0.87, "quantity": 2, "total": 1.74}, {"id": "2", "name": "Bananas", "price": 0.87, "quantity": 1, "total": 0.87}]'::jsonb,
2.61, 0.39, 3.00, 'Cash', 'completed', 'First test order', (SELECT id FROM delivery_providers WHERE name = 'Unknown'));
