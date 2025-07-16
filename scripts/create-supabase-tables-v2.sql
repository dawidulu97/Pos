-- This script adds a `store_id` column to all relevant tables
-- and updates RLS policies to filter data by `store_id`.

-- Add `store_id` column to tables
ALTER TABLE products ADD COLUMN store_id UUID;
ALTER TABLE categories ADD COLUMN store_id UUID;
ALTER TABLE customers ADD COLUMN store_id UUID;
ALTER TABLE orders ADD COLUMN store_id UUID;
ALTER TABLE order_items ADD COLUMN store_id UUID;
ALTER TABLE settings ADD COLUMN store_id UUID UNIQUE; -- Settings should be unique per store

-- Update existing rows with a default store_id (replace with your actual store ID if known)
-- You might want to generate a new UUID for your default store or use an existing one.
-- For demonstration, let's use a fixed UUID.
UPDATE products SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;
UPDATE categories SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;
UPDATE customers SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;
UPDATE orders SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;
UPDATE order_items SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;
UPDATE settings SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;

-- Make `store_id` NOT NULL after updating existing rows
ALTER TABLE products ALTER COLUMN store_id SET NOT NULL;
ALTER TABLE categories ALTER COLUMN store_id SET NOT NULL;
ALTER TABLE customers ALTER COLUMN store_id SET NOT NULL;
ALTER TABLE orders ALTER COLUMN store_id SET NOT NULL;
ALTER TABLE order_items ALTER COLUMN store_id SET NOT NULL;
ALTER TABLE settings ALTER COLUMN store_id SET NOT NULL;

-- Update RLS policies to filter by `store_id`
-- This assumes `auth.uid()` can be used to determine the current user's store_id,
-- or that `store_id` is passed in the context. For simplicity, we'll assume
-- a mechanism to get the current store_id (e.g., from a user's profile or session).
-- For now, we'll use a placeholder for `current_store_id()`.
-- In a real application, you'd replace `current_store_id()` with a function
-- that retrieves the store_id associated with the authenticated user or session.

-- Helper function (example - you'd implement this based on your auth/store logic)
-- CREATE OR REPLACE FUNCTION public.current_store_id()
-- RETURNS UUID AS $$
--   SELECT '00000000-0000-0000-0000-000000000001'::UUID; -- Replace with actual logic
-- $$ LANGUAGE sql STABLE;

-- Policies for `products` table
DROP POLICY IF EXISTS "Enable read access for users of the same store" ON products;
CREATE POLICY "Enable read access for users of the same store" ON products
  FOR SELECT USING (store_id = '00000000-0000-0000-0000-000000000001'); -- Replace with current_store_id()

DROP POLICY IF EXISTS "Enable write access for users of the same store" ON products;
CREATE POLICY "Enable write access for users of the same store" ON products
  FOR ALL USING (store_id = '00000000-0000-0000-0000-000000000001') WITH CHECK (store_id = '00000000-0000-0000-0000-000000000001'); -- Replace with current_store_id()

-- Policies for `categories` table
DROP POLICY IF EXISTS "Enable read access for users of the same store on categories" ON categories;
CREATE POLICY "Enable read access for users of the same store on categories" ON categories
  FOR SELECT USING (store_id = '00000000-0000-0000-0000-000000000001'); -- Replace with current_store_id()

DROP POLICY IF EXISTS "Enable write access for users of the same store on categories" ON categories;
CREATE POLICY "Enable write access for users of the same store on categories" ON categories
  FOR ALL USING (store_id = '00000000-0000-0000-0000-000000000001') WITH CHECK (store_id = '00000000-0000-0000-0000-000000000001'); -- Replace with current_store_id()

-- Policies for `customers` table
DROP POLICY IF EXISTS "Enable read access for users of the same store on customers" ON customers;
CREATE POLICY "Enable read access for users of the same store on customers" ON customers
  FOR SELECT USING (store_id = '00000000-0000-0000-0000-000000000001'); -- Replace with current_store_id()

DROP POLICY IF EXISTS "Enable write access for users of the same store on customers" ON customers;
CREATE POLICY "Enable write access for users of the same store on customers" ON customers
  FOR ALL USING (store_id = '00000000-0000-0000-0000-000000000001') WITH CHECK (store_id = '00000000-0000-0000-0000-000000000001'); -- Replace with current_store_id()

-- Policies for `orders` table
DROP POLICY IF EXISTS "Enable read access for users of the same store on orders" ON orders;
CREATE POLICY "Enable read access for users of the same store on orders" ON orders
  FOR SELECT USING (store_id = '00000000-0000-0000-0000-000000000001'); -- Replace with current_store_id()

DROP POLICY IF EXISTS "Enable write access for users of the same store on orders" ON orders;
CREATE POLICY "Enable write access for users of the same store on orders" ON orders
  FOR ALL USING (store_id = '00000000-0000-0000-0000-000000000001') WITH CHECK (store_id = '00000000-0000-0000-0000-000000000001'); -- Replace with current_store_id()

-- Policies for `order_items` table
DROP POLICY IF EXISTS "Enable read access for users of the same store on order_items" ON order_items;
CREATE POLICY "Enable read access for users of the same store on order_items" ON order_items
  FOR SELECT USING (store_id = '00000000-0000-0000-0000-000000000001'); -- Replace with current_store_id()

DROP POLICY IF EXISTS "Enable write access for users of the same store on order_items" ON order_items;
CREATE POLICY "Enable write access for users of the same store on order_items" ON order_items
  FOR ALL USING (store_id = '00000000-0000-0000-0000-000000000001') WITH CHECK (store_id = '00000000-0000-0000-0000-000000000001'); -- Replace with current_store_id()

-- Policies for `settings` table
DROP POLICY IF EXISTS "Enable read access for users of the same store on settings" ON settings;
CREATE POLICY "Enable read access for users of the same store on settings" ON settings
  FOR SELECT USING (store_id = '00000000-0000-0000-0000-000000000001'); -- Replace with current_store_id()

DROP POLICY IF EXISTS "Enable write access for users of the same store on settings" ON settings;
CREATE POLICY "Enable write access for users of the same store on settings" ON settings
  FOR ALL USING (store_id = '00000000-0000-0000-0000-000000000001') WITH CHECK (store_id = '00000000-0000-0000-0000-000000000001'); -- Replace with current_store_id()
