-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image VARCHAR(10) DEFAULT '📦',
  category VARCHAR(100) NOT NULL,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  sku VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
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
  delivery_provider_id TEXT REFERENCES delivery_providers(id),
  delivery_provider_name TEXT,
  shipping_address TEXT,
  shipping_cost NUMERIC(10, 2) DEFAULT 0,
  order_type TEXT DEFAULT 'retail',
  payment_status TEXT DEFAULT 'paid',
  voided_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_reason TEXT,
  cash_drawer_start_amount NUMERIC(10, 2),
  cash_drawer_end_amount NUMERIC(10, 2),
  cash_in_amount NUMERIC(10, 2),
  cash_out_amount NUMERIC(10, 2),
  z_report_printed_at TIMESTAMP WITH TIME ZONE
);

-- Add categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Insert default categories if they don't exist
INSERT INTO categories (name)
VALUES
    ('Surface'),
    ('Accessories'),
    ('Laptops'),
    ('Desktops'),
    ('Monitors'),
    ('Peripherals'),
    ('Software'),
    ('Services')
ON CONFLICT (name) DO NOTHING;

-- Add delivery_providers table
CREATE TABLE IF NOT EXISTS delivery_providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    contact_phone TEXT,
    contact_email TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed some initial delivery providers if the table is empty
INSERT INTO delivery_providers (id, name, contact_phone, contact_email, is_active) VALUES
('dp_aramex', 'Aramex', '+96265358888', 'info@aramex.com', TRUE),
('dp_dhl', 'DHL Express', '+96265606060', 'support@dhl.com', TRUE),
('dp_fedex', 'FedEx', '+96265800000', 'service@fedex.com', TRUE),
('dp_jordan_post', 'Jordan Post', '+96264625221', 'info@jordanpost.com.jo', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert default delivery providers and their city-specific fees
-- This part is not needed as we have updated the delivery_providers table structure
-- INSERT INTO delivery_providers (name, default_fee)
-- VALUES
--     ('Local Delivery', 5.00),
--     ('Express Courier', 15.00)
-- ON CONFLICT (name) DO NOTHING;

-- Insert city fees for Local Delivery
-- This part is not needed as we have updated the delivery_providers table structure
-- INSERT INTO city_fees (provider_id, city, fee)
-- SELECT id, 'Baghdad', 7.50 FROM delivery_providers WHERE name = 'Local Delivery'
-- ON CONFLICT (provider_id, city) DO UPDATE SET fee = EXCLUDED.fee;

-- INSERT INTO city_fees (provider_id, city, fee)
-- SELECT id, 'Basra', 8.00 FROM delivery_providers WHERE name = 'Local Delivery'
-- ON CONFLICT (provider_id, city) DO UPDATE SET fee = EXCLUDED.fee;

-- Insert city fees for Express Courier
-- This part is not needed as we have updated the delivery_providers table structure
-- INSERT INTO city_fees (provider_id, city, fee)
-- SELECT id, 'Erbil', 20.00 FROM delivery_providers WHERE name = 'Express Courier'
-- ON CONFLICT (provider_id, city) DO UPDATE SET fee = EXCLUDED.fee;

-- INSERT INTO city_fees (provider_id, city, fee)
-- SELECT id, 'Duhok', 22.00 FROM delivery_providers WHERE name = 'Express Courier'
-- ON CONFLICT (provider_id, city) DO UPDATE SET fee = EXCLUDED.fee;

-- Clear existing data and insert fresh sample data
DELETE FROM orders;
DELETE FROM customers;
DELETE FROM products;

-- Insert sample customers first
INSERT INTO customers (id, name, email, phone, address) VALUES
('00000000-0000-0000-0000-000000000001', 'Guest', '', '', ''),
('00000000-0000-0000-0000-000000000002', 'John Smith', 'john@example.com', '123-456-7890', '123 Main St'),
('00000000-0000-0000-0000-000000000003', 'Sarah Johnson', 'sarah@example.com', '098-765-4321', '456 Oak Ave'),
('00000000-0000-0000-0000-000000000004', 'Mike Wilson', 'mike@example.com', '555-123-4567', '789 Pine St'),
('00000000-0000-0000-0000-000000000005', 'Emma Davis', 'emma@example.com', '444-987-6543', '321 Elm Ave');

-- Insert sample products
INSERT INTO products (name, price, image, category, stock, sku) VALUES
-- Fruits
('Apples', 0.87, '🍎', 'Fruit', 50, 'FRUIT-001'),
('Bananas', 0.87, '🍌', 'Fruit', 30, 'FRUIT-002'),
('Strawberries', 1.00, '🍓', 'Fruit', 25, 'FRUIT-003'),
('Oranges', 0.95, '🍊', 'Fruit', 40, 'FRUIT-004'),
('Grapes', 2.50, '🍇', 'Fruit', 20, 'FRUIT-005'),

-- Vegetables
('Carrots', 0.65, '🥕', 'Vegetables', 40, 'VEG-001'),
('Tomatoes', 1.20, '🍅', 'Vegetables', 35, 'VEG-002'),
('Broccoli', 1.80, '🥦', 'Vegetables', 25, 'VEG-003'),
('Potatoes', 0.45, '🥔', 'Vegetables', 60, 'VEG-004'),
('Onions', 0.55, '🧅', 'Vegetables', 45, 'VEG-005'),

-- Bakery
('Baguette', 2.50, '🥖', 'Bakery', 8, 'BAKERY-001'),
('Croissant', 1.75, '🥐', 'Bakery', 12, 'BAKERY-002'),
('Sourdough Bread', 3.25, '🍞', 'Bakery', 6, 'BAKERY-003'),

-- Dairy
('Milk', 1.85, '🥛', 'Dairy', 20, 'DAIRY-001'),
('Cheese', 3.50, '🧀', 'Dairy', 15, 'DAIRY-002'),
('Yogurt', 1.25, '🥛', 'Dairy', 30, 'DAIRY-003'),
('Butter', 2.75, '🧈', 'Dairy', 18, 'DAIRY-004'),

-- Meat
('Chicken Breast', 5.99, '🐔', 'Meat', 12, 'MEAT-001'),
('Ground Beef', 4.50, '🥩', 'Meat', 10, 'MEAT-002'),
('Salmon Fillet', 8.99, '🐟', 'Meat', 8, 'MEAT-003'),

-- Beverages
('Orange Juice', 2.25, '🍊', 'Beverages', 18, 'BEV-001'),
('Sparkling Water', 1.50, '💧', 'Beverages', 25, 'BEV-002'),
('Coffee', 4.50, '☕', 'Beverages', 15, 'BEV-003');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert access for all users" ON products;
DROP POLICY IF EXISTS "Enable update access for all users" ON products;
DROP POLICY IF EXISTS "Enable delete access for all users" ON products;

DROP POLICY IF EXISTS "Enable read access for all users" ON customers;
DROP POLICY IF EXISTS "Enable insert access for all users" ON customers;
DROP POLICY IF EXISTS "Enable update access for all users" ON customers;
DROP POLICY IF EXISTS "Enable delete access for all users" ON customers;

DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Enable insert access for all users" ON orders;
DROP POLICY IF EXISTS "Enable update access for all users" ON orders;
DROP POLICY IF EXISTS "Enable delete access for all users" ON orders;

-- Create policies for public access
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

-- Update existing rows to set a default value for the new column
-- This is a placeholder; in a real scenario, you might derive this from provider_id
UPDATE orders
SET delivery_provider_name = 'Unknown'
WHERE delivery_provider_name IS NULL;

-- Make the column NOT NULL if all existing data has been handled
ALTER TABLE orders
ALTER COLUMN delivery_provider_name SET NOT NULL;

-- Insert a sample order for testing
INSERT INTO orders (customer_id, customer_name, items, subtotal, tax, total, payment_method, status, notes, delivery_provider_name) VALUES
('00000000-0000-0000-0000-000000000002', 'John Smith', 
'[{"id": "1", "name": "Apples", "price": 0.87, "quantity": 2, "total": 1.74}, {"id": "2", "name": "Bananas", "price": 0.87, "quantity": 1, "total": 0.87}]'::jsonb,
2.61, 0.39, 3.00, 'Cash', 'completed', 'First test order', 'Unknown');
