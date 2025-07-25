-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist to ensure a clean slate
-- CASCADE will drop dependent objects like foreign keys
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS delivery_providers CASCADE;
DROP TABLE IF EXISTS city_fees CASCADE;

-- Create products table with new is_express_laptop column
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image VARCHAR(10) DEFAULT '💻', -- Default laptop icon
  category VARCHAR(100) NOT NULL,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  sku VARCHAR(100) UNIQUE NOT NULL,
  is_express_laptop BOOLEAN DEFAULT FALSE, -- New column for express laptop shipping
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table (re-creating to ensure clean slate)
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT, -- Assuming city can be parsed from here for shipping
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table with new total_discount_percentage and shipping_fee columns
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
  total_discount_percentage DECIMAL(5,2) DEFAULT 0,
  shipping_fee DECIMAL(10,2) DEFAULT 0, -- New column for shipping fee
  shipping_address TEXT,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  delivery_provider_id TEXT REFERENCES delivery_providers(id) ON DELETE SET NULL,
  delivery_provider_name TEXT, -- Denormalized for easier reporting
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample customers first
INSERT INTO customers (id, name, email, phone, address) VALUES
('00000000-0000-0000-0000-000000000001', 'Guest', '', '', ''),
('00000000-0000-0000-0000-000000000002', 'John Smith', 'john@example.com', '123 Main St, Baghdad'),
('00000000-0000-0000-0000-000000000003', 'Sarah Johnson', 'sarah@example.com', '456 Oak Ave, Erbil');

-- Insert sample products, marking one as an express laptop
INSERT INTO products (name, price, image, category, stock, sku, is_express_laptop) VALUES
('Surface Laptop Studio 2', 2499.99, '💻', 'Surface', 10, 'SLS2-001', TRUE), -- Marked as express laptop
('Surface Pro 9', 1299.00, '💻', 'Surface', 15, 'SP9-001', FALSE),
('Surface Go 3', 549.00, '💻', 'Surface', 20, 'SG3-001', FALSE),
('Surface Laptop 5', 1099.00, '💻', 'Surface', 12, 'SL5-001', FALSE),
('Surface Studio 2+', 4499.00, '🖥️', 'Surface', 5, 'SS2P-001', FALSE),
('Surface Headphones 2', 249.00, '🎧', 'Accessories', 30, 'SH2-001', FALSE),
('Surface Pen', 99.99, '🖊️', 'Accessories', 50, 'SPEN-001', FALSE),
('Surface Keyboard', 129.99, '⌨️', 'Accessories', 25, 'SKEY-001', FALSE);

-- Create delivery_providers table
CREATE TABLE IF NOT EXISTS delivery_providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    contact_phone TEXT,
    contact_email TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create city_fees table
CREATE TABLE IF NOT EXISTS city_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id TEXT NOT NULL REFERENCES delivery_providers(id) ON DELETE CASCADE,
    city VARCHAR(255) NOT NULL,
    fee DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (provider_id, city)
);

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

-- Create policies for public access (adjust for production security)
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

-- Insert a sample order for testing
INSERT INTO orders (customer_id, customer_name, items, subtotal, tax, total, payment_method, status, notes, total_discount_percentage, shipping_fee, shipping_address, shipping_cost, delivery_provider_id) VALUES
('00000000-0000-0000-0000-000000000002', 'John Smith',
'[{"id": "SLS2-001", "name": "Surface Laptop Studio 2", "price": 2499.99, "quantity": 1, "total": 2499.99}]'::jsonb,
2499.99, 0.00, 2499.99, 'Card', 'completed', 'First laptop order', 0, 0, 'Baghdad', 0, NULL);

-- Seed some initial delivery providers if the table is empty
INSERT INTO delivery_providers (id, name, contact_phone, contact_email, is_active) VALUES
('dp_aramex', 'Aramex', '+96265358888', 'info@aramex.com', TRUE),
('dp_dhl', 'DHL Express', '+96265606060', 'support@dhl.com', TRUE),
('dp_fedex', 'FedEx', '+96265800000', 'service@fedex.com', TRUE),
('dp_jordan_post', 'Jordan Post', '+96264625221', 'info@jordanpost.com.jo', TRUE)
ON CONFLICT (id) DO NOTHING;
