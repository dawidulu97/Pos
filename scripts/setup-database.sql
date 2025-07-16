-- This script sets up initial data for the POS system.
-- It's designed to be idempotent, meaning it can be run multiple times without
-- causing issues (e.g., by checking for existing data before inserting).

-- Insert sample categories if they don't exist
INSERT INTO categories (id, name)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Electronics') ON CONFLICT (name) DO NOTHING,
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Apparel') ON CONFLICT (name) DO NOTHING,
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Books') ON CONFLICT (name) DO NOTHING;

-- Insert sample products if they don't exist
INSERT INTO products (id, name, description, price, sku, image, stock, category)
VALUES
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Laptop Pro', 'Powerful laptop for professionals.', 1200.00, 'LAPTOP-PRO-001', '/images/opensooq/laptop-front.webp', 50, 'Electronics') ON CONFLICT (sku) DO NOTHING,
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Mechanical Keyboard', 'RGB mechanical keyboard with clicky switches.', 80.00, 'KEYBOARD-MECH-001', '/images/opensooq/laptop-keyboard.jpeg', 100, 'Electronics') ON CONFLICT (sku) DO NOTHING,
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Wireless Mouse', 'Ergonomic wireless mouse.', 25.00, 'MOUSE-WIRELESS-001', '/placeholder.svg', 200, 'Electronics') ON CONFLICT (sku) DO NOTHING,
  ('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'T-Shirt (Large)', 'Comfortable cotton t-shirt, large size.', 15.00, 'TSHIRT-L-001', '/placeholder.svg', 150, 'Apparel') ON CONFLICT (sku) DO NOTHING,
  ('h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'The Great Novel', 'A captivating story of adventure and mystery.', 20.00, 'BOOK-NOVEL-001', '/placeholder.svg', 75, 'Books') ON CONFLICT (sku) DO NOTHING;

-- Insert sample customers if they don't exist
INSERT INTO customers (id, name, email, phone, address)
VALUES
  ('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Alice Smith', 'alice@example.com', '555-123-4567', '123 Main St, Anytown') ON CONFLICT (email) DO NOTHING,
  ('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Bob Johnson', 'bob@example.com', '555-987-6543', '456 Oak Ave, Somewhere') ON CONFLICT (email) DO NOTHING;

-- Insert default settings if they don't exist
INSERT INTO settings (id, store_name, tax_rate, currency_symbol, decimal_places, receipt_printer_enabled, payment_methods, shipping_enabled, delivery_providers)
VALUES
  ('k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'My Awesome Store', 0.07, '$', 2, TRUE,
   '[{"id": "cash", "name": "Cash", "isPaid": true}, {"id": "card", "name": "Card", "isPaid": true}, {"id": "credit", "name": "Store Credit", "isPaid": false}]'::jsonb,
   TRUE,
   '[{"id": "fedex", "name": "FedEx", "cost_per_km": 0.5}, {"id": "dhl", "name": "DHL", "cost_per_km": 0.6}]'::jsonb
  ) ON CONFLICT (id) DO NOTHING;

-- Insert sample orders and order items if they don't exist
-- Order 1: Completed retail order
INSERT INTO orders (id, customer_id, customer_name, total, total_amount, subtotal, tax_amount, total_discount, total_fees, payment_method, amount_paid, change_due, status, order_type, payment_status)
VALUES
  ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Alice Smith', 1284.00, 1284.00, 1200.00, 84.00, 0.00, 0.00, 'card', 1284.00, 0.00, 'completed', 'retail', 'paid') ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, name, quantity, price, discount)
VALUES
  ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Laptop Pro', 1, 1200.00, 0.00) ON CONFLICT (order_id, product_id) DO NOTHING;

-- Order 2: Pending delivery order with discount
INSERT INTO orders (id, customer_id, customer_name, total, total_amount, subtotal, tax_amount, total_discount, total_fees, payment_method, amount_paid, change_due, status, shipping_address, shipping_cost, delivery_provider_id, delivery_provider_name, shipping_city, order_type, payment_status)
VALUES
  ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Bob Johnson', 107.00, 107.00, 105.00, 7.00, 5.00, 0.00, 'cash', 110.00, 3.00, 'pending', '789 Pine Ln, Villagetown', 5.00, 'fedex', 'FedEx', 'Villagetown', 'delivery', 'unpaid') ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, name, quantity, price, discount)
VALUES
  ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Mechanical Keyboard', 1, 80.00, 0.00) ON CONFLICT (order_id, product_id) DO NOTHING,
  ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Wireless Mouse', 1, 25.00, 5.00) ON CONFLICT (order_id, product_id) DO NOTHING;

-- Order 3: Voided order
INSERT INTO orders (id, customer_id, customer_name, total, total_amount, subtotal, tax_amount, total_discount, total_fees, payment_method, amount_paid, change_due, status, voided_at, order_type, payment_status)
VALUES
  ('n0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', NULL, 'Guest', 16.05, 16.05, 15.00, 1.05, 0.00, 0.00, 'cash', 20.00, 3.95, 'voided', NOW(), 'retail', 'paid') ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, name, quantity, price, discount)
VALUES
  ('n0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'T-Shirt (Large)', 1, 15.00, 0.00) ON CONFLICT (order_id, product_id) DO NOTHING;
