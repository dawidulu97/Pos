-- This script updates the database schema to include a dedicated categories table.

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add a default 'Uncategorized' category if it doesn't exist
INSERT INTO categories (id, name)
VALUES ('cat_uncategorized', 'Uncategorized')
ON CONFLICT (id) DO NOTHING;

-- Update existing products to ensure their category matches an entry in the categories table.
-- If a product's category is NULL or doesn't exist in the categories table,
-- it will be assigned to 'Uncategorized'.
UPDATE products
SET category = COALESCE(
    (SELECT c.name FROM categories c WHERE c.name = products.category),
    'Uncategorized'
)
WHERE products.category IS DISTINCT FROM COALESCE(
    (SELECT c.name FROM categories c WHERE c.name = products.category),
    'Uncategorized'
);

-- Optional: If you want to enforce referential integrity, you can add a foreign key constraint.
-- This requires all existing product categories to already be in the categories table.
-- ALTER TABLE products
-- ADD CONSTRAINT fk_product_category
-- FOREIGN KEY (category) REFERENCES categories(name)
-- ON UPDATE CASCADE ON DELETE SET DEFAULT; -- Or ON DELETE RESTRICT, etc.
-- Note: Using a text column as a foreign key can be less performant than UUIDs or integers.
