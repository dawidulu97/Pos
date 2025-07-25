-- This script is used to reset and re-seed the 'products' and 'categories' tables.
-- Use with caution as it will DELETE all existing data in these tables.

-- Disable RLS temporarily if enabled, to ensure TRUNCATE works without issues
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Truncate (clear) existing data from products and categories tables
TRUNCATE TABLE products RESTART IDENTITY CASCADE;
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

-- Re-seed initial categories
INSERT INTO categories (id, name) VALUES
('cat_coffee_equipment', 'Coffee Equipment'),
('cat_coffee_beans', 'Coffee Beans'),
('cat_merchandise', 'Merchandise'),
('cat_drinks', 'Drinks'),
('cat_food', 'Food'),
('cat_uncategorized', 'Uncategorized')
ON CONFLICT (id) DO NOTHING;

-- Re-seed initial products
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
('prod_010', 'Coffee Grinder (Manual)', 55.00, '⚙️', 'Coffee Equipment', 10, 'COFGRN001'),
('prod_011', 'V60 Dripper', 20.00, '☕', 'Coffee Equipment', 30, 'V60DRP001'),
('prod_012', 'Chemex (6-cup)', 45.00, '☕', 'Coffee Equipment', 8, 'CHMX6CUP001'),
('prod_013', 'Ethiopian Yirgacheffe (250g)', 18.00, '🫘', 'Coffee Beans', 40, 'ETHRGC001'),
('prod_014', 'Brazilian Santos (250g)', 14.00, '🫘', 'Coffee Beans', 60, 'BRZSNT001'),
('prod_015', 'KeepCup (Glass, 12oz)', 22.00, '🥤', 'Merchandise', 50, 'KPCUPGLS001')
ON CONFLICT (id) DO NOTHING;

-- Re-enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Note: If you have foreign key constraints that reference these tables
-- (e.g., from order_items to products), ensure that those tables are
-- either truncated/reset as well, or that the foreign key constraints
-- are temporarily dropped and re-added, or that ON DELETE CASCADE is set.
-- The `CASCADE` option on TRUNCATE above handles this for `order_items`.
