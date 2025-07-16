-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Drop existing tables if they exist to ensure a clean slate
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS order_items CASCADE; -- Added to handle order_items table

-- Create products table with updated default image
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image VARCHAR(10) DEFAULT '💻', -- Default laptop icon
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL, -- Updated to reference categories table
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  sku VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category TEXT -- Added category column
);

-- Create customers table (re-creating to ensure clean slate)
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add delivery_providers table
CREATE TABLE IF NOT EXISTS delivery_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    default_fee NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- Add city_fees table for delivery providers
CREATE TABLE IF NOT EXISTS city_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES delivery_providers(id) ON DELETE CASCADE,
    city VARCHAR(255) NOT NULL,
    fee NUMERIC(10, 2) NOT NULL,
    UNIQUE (provider_id, city) -- Ensure unique city fee per provider
);

-- Create orders table with new total_discount_percentage column
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Added 'items' column
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  tax DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  notes TEXT,
  shipping_info TEXT,
  total_discount_percentage DECIMAL(5,2) DEFAULT 0, -- New column for total order discount
  delivery_provider_id UUID REFERENCES delivery_providers(id) ON DELETE SET NULL, -- Updated to reference delivery_providers table
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_discount NUMERIC(10, 2) DEFAULT 0, -- Added total_discount column
  total_fees NUMERIC(10, 2) DEFAULT 0, -- Added total_fees column
  payment_status TEXT DEFAULT 'unpaid', -- 'paid', 'unpaid', 'partially_paid'
  voided_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_reason TEXT,
  cash_drawer_start_amount NUMERIC(10, 2),
  cash_drawer_end_amount NUMERIC(10, 2),
  cash_in_amount NUMERIC(10, 2),
  cash_out_amount NUMERIC(10, 2),
  z_report_printed_at TIMESTAMP WITH TIME ZONE,
  order_type TEXT DEFAULT 'retail' -- 'retail' or 'delivery'
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT, -- Added name column for denormalization
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  discount NUMERIC(10, 2) DEFAULT 0, -- Added discount column
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Added created_at column
);

-- Insert sample customers first
INSERT INTO customers (id, name, email, phone, address) VALUES
('00000000-0000-0000-0000-000000000001', 'Guest', '', '', ''),
('00000000-0000-0000-0000-000000000002', 'John Smith', 'john@example.com', '123-456-7890', '123 Main St'),
('00000000-0000-0000-0000-000000000003', 'Sarah Johnson', 'sarah@example.com', '098-765-4321', '456 Oak Ave');

-- Insert a default laptop product for the "Surface" category
INSERT INTO products (name, price, image, category_id, stock, sku, category) VALUES
('Surface Laptop Studio 2', 2499.99, '💻', (SELECT id FROM categories WHERE name = 'Surface'), 10, 'SLS2-001', 'Surface'),
('Surface Pro 9', 1299.00, '💻', (SELECT id FROM categories WHERE name = 'Surface'), 15, 'SP9-001', 'Surface'),
('Surface Go 3', 549.00, '💻', (SELECT id FROM categories WHERE name = 'Surface'), 20, 'SG3-001', 'Surface'),
('Surface Laptop 5', 1099.00, '💻', (SELECT id FROM categories WHERE name = 'Surface'), 12, 'SL5-001', 'Surface'),
('Surface Studio 2+', 4499.00, '🖥️', (SELECT id FROM categories WHERE name = 'Surface'), 5, 'SS2P-001', 'Surface'),
('Surface Headphones 2', 249.00, '🎧', (SELECT id FROM categories WHERE name = 'Accessories'), 30, 'SH2-001', 'Accessories'),
('Surface Pen', 99.99, '🖊️', (SELECT id FROM categories WHERE name = 'Accessories'), 50, 'SPEN-001', 'Accessories'),
('Surface Keyboard', 129.99, '⌨️', (SELECT id FROM categories WHERE name = 'Accessories'), 25, 'SKEY-001', 'Accessories');

-- Insert default delivery providers and their city-specific fees
INSERT INTO delivery_providers (name, default_fee)
VALUES
    ('Local Delivery', 5.00),
    ('Express Courier', 15.00)
ON CONFLICT (name) DO NOTHING;

-- Insert city fees for Local Delivery
INSERT INTO city_fees (provider_id, city, fee)
SELECT id, 'Baghdad', 7.50 FROM delivery_providers WHERE name = 'Local Delivery'
ON CONFLICT (provider_id, city) DO UPDATE SET fee = EXCLUDED.fee;

INSERT INTO city_fees (provider_id, city, fee)
SELECT id, 'Basra', 8.00 FROM delivery_providers WHERE name = 'Local Delivery'
ON CONFLICT (provider_id, city) DO UPDATE SET fee = EXCLUDED.fee;

-- Insert city fees for Express Courier
INSERT INTO city_fees (provider_id, city, fee)
SELECT id, 'Erbil', 20.00 FROM delivery_providers WHERE name = 'Express Courier'
ON CONFLICT (provider_id, city) DO UPDATE SET fee = EXCLUDED.fee;

INSERT INTO city_fees (provider_id, city, fee)
SELECT id, 'Duhok', 22.00 FROM delivery_providers WHERE name = 'Express Courier'
ON CONFLICT (provider_id, city) DO UPDATE SET fee = EXCLUDED.fee;

-- Update existing rows to set a default value for the new column
-- This is a placeholder; in a real scenario, you might derive this from provider_id
UPDATE orders
SET delivery_provider_name = 'Unknown'
WHERE delivery_provider_name IS NULL;

-- Make the column NOT NULL if all existing data has been handled
ALTER TABLE orders
ALTER COLUMN delivery_provider_name SET NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id); -- Added index for order_items table
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id); -- Added index for order_items table

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
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY; -- Added RLS for order_items table

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

DROP POLICY IF EXISTS "Enable read access for all users" ON order_items; -- Added policy for order_items table
DROP POLICY IF EXISTS "Enable insert access for all users" ON order_items; -- Added policy for order_items table
DROP POLICY IF EXISTS "Enable update access for all users" ON order_items; -- Added policy for order_items table
DROP POLICY IF EXISTS "Enable delete access for all users" ON order_items; -- Added policy for order_items table

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

-- Order_items policies
CREATE POLICY "Enable read access for all users" ON order_items FOR SELECT USING (true); -- Added policy for order_items table
CREATE POLICY "Enable insert access for all users" ON order_items FOR INSERT WITH CHECK (true); -- Added policy for order_items table
CREATE POLICY "Enable update access for all users" ON order_items FOR UPDATE USING (true); -- Added policy for order_items table
CREATE POLICY "Enable delete access for all users" ON order_items FOR DELETE USING (true); -- Added policy for order_items table

-- Insert a sample order for testing
INSERT INTO orders (customer_id, customer_name, items, subtotal, tax, total, payment_method, status, notes, total_discount_percentage, delivery_provider_id) VALUES
('00000000-0000-0000-0000-000000000002', 'John Smith',
'[{"id": "SLS2-001", "name": "Surface Laptop Studio 2", "price": 2499.99, "quantity": 1, "total": 2499.99}]'::jsonb,
2499.99, 125.00, 2624.99, 'Card', 'completed', 'First laptop order', 0, (SELECT id FROM delivery_providers WHERE name = 'Unknown'));

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

-- Update existing products to have an image if it's null
UPDATE products
SET image = '📦'
WHERE image IS NULL;

-- Update existing products to have a stock value if it's null
UPDATE products
SET stock = 100
WHERE stock IS NULL;

-- Update existing products to have a SKU if it's null
-- Generate a simple SKU based on product name for existing entries
UPDATE products
SET sku = 'SKU-' || UPPER(REPLACE(SUBSTRING(name FROM 1 FOR 5), ' ', '')) || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
WHERE sku IS NULL;

-- Update existing products to have a category if it's null
UPDATE products
SET category = 'Uncategorized'
WHERE category IS NULL;

-- Update existing orders to populate customer_name from customers table
-- This assumes a foreign key relationship or a way to join
UPDATE orders o
SET customer_name = c.name
FROM customers c
WHERE o.customer_id = c.id AND o.customer_name IS NULL;

-- Add a default "Guest" customer if not exists
INSERT INTO customers (id, name, email, phone, address)
VALUES ('00000000-0000-0000-0000-000000000001', 'Guest', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Update existing customers to have an empty address if it's null
UPDATE customers
SET address = ''
WHERE address IS NULL;

-- Update existing customers to have empty email/phone if null
UPDATE customers
SET email = ''
WHERE email IS NULL;

UPDATE customers
SET phone = ''
WHERE phone IS NULL;

-- Update existing orders to populate the 'items' column based on 'order_items'
-- This is a complex operation and might require a custom function or a more sophisticated migration
-- For simplicity, this example assumes you might manually backfill or handle this in application logic
-- A direct SQL migration for this would look something like:
/*
UPDATE orders o
SET items = (
    SELECT jsonb_agg(jsonb_build_object(
        'product_id', oi.product_id,
        'quantity', oi.quantity,
        'price', oi.price,
        'discount', oi.discount,
        'name', p.name -- Assuming product name is needed in the summary
    ))
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = o.id
);
*/
-- Note: The above UPDATE statement is commented out as it might be too complex for a simple script
-- and could be better handled in application-level data migration if needed for existing data.
-- For new orders, the application logic will populate this column.

-- Backfill `name` for existing `order_items` from `products` table
UPDATE order_items oi
SET name = p.name
FROM products p
WHERE oi.product_id = p.id AND oi.name IS NULL;

-- Make `name` column NOT NULL after backfilling
ALTER TABLE order_items ALTER COLUMN name SET NOT NULL;

-- Update existing orders with calculated values (example, adjust as needed)
-- This is a simplified example and might need more complex logic
-- depending on how your existing data is structured.
UPDATE orders
SET
    subtotal = (SELECT COALESCE(SUM(oi.quantity * oi.price), 0) FROM order_items oi WHERE oi.order_id = orders.id),
    total_discount = (SELECT COALESCE(SUM(oi.discount), 0) FROM order_items oi WHERE oi.order_id = orders.id),
    total_fees = 0, -- Assuming no existing fees, or calculate if applicable
    tax_amount = (SELECT COALESCE(SUM(oi.quantity * oi.price * 0.07), 0) FROM order_items oi WHERE oi.order_id = orders.id), -- Assuming 7% tax
    total_amount = (SELECT COALESCE(SUM(oi.quantity * oi.price * 1.07), 0) FROM order_items oi WHERE oi.order_id = orders.id) -- Assuming 7% tax
WHERE
    total_amount = 0; -- Only update if not already calculated
