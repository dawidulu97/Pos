import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { OrderItem } from "@/lib/supabase"

/**
 * POST /api/orders
 * Body: { order: OrderDraft, items: OrderItemDraft[] }
 * Returns: { orderId } | { error }
 */
export async function POST(request: Request) {
  const { order, items } = await request.json()

  if (!order || !items || !Array.isArray(items)) {
    return NextResponse.json({ error: "Invalid order data" }, { status: 400 })
  }

  const supabase = createClient()

  try {
    // Insert the order
    const { data: newOrder, error: orderError } = await supabase.from("orders").insert(order).select().single()

    if (orderError) {
      console.error("Error inserting order:", orderError)
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // Prepare order items for insertion
    const orderItemsToInsert = items.map((item: Omit<OrderItem, "id" | "order_id">) => ({
      ...item,
      order_id: newOrder.id,
    }))

    // Insert order items
    const { error: orderItemsError } = await supabase.from("order_items").insert(orderItemsToInsert)

    if (orderItemsError) {
      console.error("Error inserting order items:", orderItemsError)
      // Optionally, roll back the order if item insertion fails
      await supabase.from("orders").delete().eq("id", newOrder.id)
      return NextResponse.json({ error: orderItemsError.message }, { status: 500 })
    }

    return NextResponse.json({ orderId: newOrder.id, message: "Order created successfully" }, { status: 201 })
  } catch (error: any) {
    console.error("Unexpected error creating order:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
