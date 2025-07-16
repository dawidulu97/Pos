import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Order } from "@/lib/supabase"

export async function POST(request: Request) {
  const { orderIds, status } = await request.json()

  if (!Array.isArray(orderIds) || orderIds.length === 0 || !status) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 })
  }

  const supabase = createClient()

  const { data, error } = await supabase
    .from("orders")
    .update({ status: status as Order["status"], updated_at: new Date().toISOString() })
    .in("id", orderIds)
    .select("id")

  if (error) {
    console.error("Error batch updating orders:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ updatedCount: data?.length || 0 })
}
