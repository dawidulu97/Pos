-- Add a 'category' column to the 'products' table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='category') THEN
        ALTER TABLE products ADD COLUMN category TEXT;
    END IF;
END
$$;

-- Update existing products to assign a default category if they don't have one
-- For simplicity, assigning 'Electronics' to existing products without a category
UPDATE products SET category = 'Electronics' WHERE category IS NULL;
