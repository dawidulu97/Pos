import { NextResponse } from "next/server"

/**
 * GET /api/orders/fetch
 * Returns an empty orders array so the POS homepage can render without
 * depending on external data or environment variables.
 * Replace this stub with real Supabase queries when you’re ready.
 */
export async function GET() {
  return NextResponse.json({ orders: [] })
}
