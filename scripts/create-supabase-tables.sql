CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  sku TEXT UNIQUE,
  image TEXT,
  stock INTEGER DEFAULT 0,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT,
  total NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  tax_amount NUMERIC(10, 2) NOT NULL,
  total_discount NUMERIC(10, 2) NOT NULL,
  total_fees NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  amount_paid NUMERIC(10, 2) NOT NULL,
  change_due NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- e.g., 'pending', 'completed', 'voided', 'refunded'
  shipping_address TEXT,
  shipping_cost NUMERIC(10, 2) DEFAULT 0,
  delivery_provider_id UUID,
  delivery_provider_name TEXT,
  shipping_city TEXT,
  order_type TEXT DEFAULT 'retail', -- 'retail' or 'delivery'
  payment_status TEXT DEFAULT 'unpaid', -- 'paid', 'unpaid', 'partially_paid'
  voided_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_reason TEXT,
  cash_drawer_start_amount NUMERIC(10, 2),
  cash_drawer_end_amount NUMERIC(10, 2),
  cash_in_amount NUMERIC(10, 2),
  cash_out_amount NUMERIC(10, 2),
  z_report_printed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  name TEXT NOT NULL, -- Denormalized product name
  quantity INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name TEXT NOT NULL,
  tax_rate NUMERIC(5, 4) DEFAULT 0.05,
  currency_symbol TEXT DEFAULT '$',
  decimal_places INTEGER DEFAULT 2,
  receipt_printer_enabled BOOLEAN DEFAULT FALSE,
  payment_methods JSONB DEFAULT '[]',
  shipping_enabled BOOLEAN DEFAULT FALSE,
  delivery_providers JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policies for `products` table
DROP POLICY IF EXISTS "Public products are viewable by everyone." ON products;
CREATE POLICY "Public products are viewable by everyone." ON products
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can insert products." ON products;
CREATE POLICY "Authenticated users can insert products." ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update their own products." ON products;
CREATE POLICY "Authenticated users can update their own products." ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete their own products." ON products;
CREATE POLICY "Authenticated users can delete their own products." ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for `categories` table
DROP POLICY IF EXISTS "Public categories are viewable by everyone." ON categories;
CREATE POLICY "Public categories are viewable by everyone." ON categories
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can insert categories." ON categories;
CREATE POLICY "Authenticated users can insert categories." ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update their own categories." ON categories;
CREATE POLICY "Authenticated users can update their own categories." ON categories
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete their own categories." ON categories;
CREATE POLICY "Authenticated users can delete their own categories." ON categories
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for `customers` table
DROP POLICY IF EXISTS "Public customers are viewable by everyone." ON customers;
CREATE POLICY "Public customers are viewable by everyone." ON customers
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can insert customers." ON customers;
CREATE POLICY "Authenticated users can insert customers." ON customers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update their own customers." ON customers;
CREATE POLICY "Authenticated users can update their own customers." ON customers
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete their own customers." ON customers;
CREATE POLICY "Authenticated users can delete their own customers." ON customers
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for `orders` table
DROP POLICY IF EXISTS "Public orders are viewable by everyone." ON orders;
CREATE POLICY "Public orders are viewable by everyone." ON orders
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can insert orders." ON orders;
CREATE POLICY "Authenticated users can insert orders." ON orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update their own orders." ON orders;
CREATE POLICY "Authenticated users can update their own orders." ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete their own orders." ON orders;
CREATE POLICY "Authenticated users can delete their own orders." ON orders
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for `order_items` table
DROP POLICY IF EXISTS "Public order_items are viewable by everyone." ON order_items;
CREATE POLICY "Public order_items are viewable by everyone." ON order_items
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can insert order_items." ON order_items;
CREATE POLICY "Authenticated users can insert order_items." ON order_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update their own order_items." ON order_items;
CREATE POLICY "Authenticated users can update their own order_items." ON order_items
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete their own order_items." ON order_items;
CREATE POLICY "Authenticated users can delete their own order_items." ON order_items
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for `settings` table
DROP POLICY IF EXISTS "Public settings are viewable by everyone." ON settings;
CREATE POLICY "Public settings are viewable by everyone." ON settings
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can insert settings." ON settings;
CREATE POLICY "Authenticated users can insert settings." ON settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update their own settings." ON settings;
CREATE POLICY "Authenticated users can update their own settings." ON settings
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete their own settings." ON settings;
CREATE POLICY "Authenticated users can delete their own settings." ON settings
  FOR DELETE USING (auth.role() = 'authenticated');
