-- This policy allows anonymous users to insert into the `order_items` table.
-- This is typically used in scenarios where order items are created
-- before a user is authenticated, or for public-facing order forms.

-- Ensure RLS is enabled for the table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might conflict (optional, but good for idempotency)
DROP POLICY IF EXISTS "Allow anon insert" ON order_items;

-- Create the policy
CREATE POLICY "Allow anon insert" ON order_items
FOR INSERT WITH CHECK (TRUE); -- TRUE means any user (including anon) can insert
