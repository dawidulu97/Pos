-- Delete all data from products and categories tables
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM customers;
DELETE FROM settings;

-- Reset sequences for auto-incrementing IDs (if any, though UUIDs don't need this)
-- For example, if you had serial IDs:
-- ALTER SEQUENCE products_id_seq RESTART WITH 1;
-- ALTER SEQUENCE categories_id_seq RESTART WITH 1;

-- Re-insert initial data (optional, if you want to start fresh with defaults)
-- You would typically run your `setup-database.sql` script after this.
