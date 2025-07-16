import type { Order } from "./supabase"

/**
 * Dummy data for demonstration purposes.
 * In a real application, this would fetch data from a backend API.
 */
const DUMMY_ORDERS: Order[] = [
  {
    id: "ord_001",
    customer_id: "cust_001",
    customer_name: "Alice Smith",
    items: [
      { product_id: "prod_001", name: "Espresso Machine", quantity: 1, price: 350.0, discount: 0 },
      { product_id: "prod_002", name: "Bag of Coffee Beans (250g)", quantity: 2, price: 15.0, discount: 0 },
    ],
    subtotal: 380.0,
    tax: 26.6,
    total: 406.6,
    payment_method: "Card",
    status: "completed",
    notes: "Customer was very happy!",
    shipping_info: null,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    delivery_provider_id: null,
    delivery_provider_name: null,
    total_amount: 406.6,
    tax_amount: 26.6,
    total_discount: 0,
    total_fees: 0,
    payment_status: "paid",
    voided_at: null,
    refunded_at: null,
    refund_reason: null,
    cash_drawer_start_amount: null,
    cash_drawer_end_amount: null,
    cash_in_amount: null,
    cash_out_amount: null,
    z_report_printed_at: null,
    order_type: "retail",
    shipping_address: null,
    shipping_cost: 0,
    shipping_city: null,
    order_items: [
      {
        id: "oi_001_1",
        order_id: "ord_001",
        product_id: "prod_001",
        name: "Espresso Machine",
        quantity: 1,
        price: 350.0,
        discount: 0,
        created_at: new Date().toISOString(),
        total: 350.0,
      },
      {
        id: "oi_001_2",
        order_id: "ord_001",
        product_id: "prod_002",
        name: "Bag of Coffee Beans (250g)",
        quantity: 2,
        price: 15.0,
        discount: 0,
        created_at: new Date().toISOString(),
        total: 30.0,
      },
    ],
  },
  {
    id: "ord_002",
    customer_id: "cust_002",
    customer_name: "Bob Johnson",
    items: [{ product_id: "prod_003", name: "Ceramic Mug", quantity: 3, price: 12.5, discount: 0 }],
    subtotal: 37.5,
    tax: 2.63,
    total: 40.13,
    payment_method: "Cash",
    status: "pending",
    notes: null,
    shipping_info: null,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    delivery_provider_id: null,
    delivery_provider_name: null,
    total_amount: 40.13,
    tax_amount: 2.63,
    total_discount: 0,
    total_fees: 0,
    payment_status: "unpaid",
    voided_at: null,
    refunded_at: null,
    refund_reason: null,
    cash_drawer_start_amount: null,
    cash_drawer_end_amount: null,
    cash_in_amount: null,
    cash_out_amount: null,
    z_report_printed_at: null,
    order_type: "retail",
    shipping_address: null,
    shipping_cost: 0,
    shipping_city: null,
    order_items: [
      {
        id: "oi_002_1",
        order_id: "ord_002",
        product_id: "prod_003",
        name: "Ceramic Mug",
        quantity: 3,
        price: 12.5,
        discount: 0,
        created_at: new Date().toISOString(),
        total: 37.5,
      },
    ],
  },
  {
    id: "ord_003",
    customer_id: null,
    customer_name: "Guest",
    items: [
      { product_id: "prod_004", name: "Latte Art Pitcher", quantity: 1, price: 25.0, discount: 0 },
      { product_id: "prod_005", name: "Digital Coffee Scale", quantity: 1, price: 45.0, discount: 5.0 },
    ],
    subtotal: 70.0,
    tax: 4.55,
    total: 69.55,
    payment_method: "Credit",
    status: "voided",
    notes: "Customer changed mind",
    shipping_info: null,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    delivery_provider_id: null,
    delivery_provider_name: null,
    total_amount: 69.55,
    tax_amount: 4.55,
    total_discount: 5.0,
    total_fees: 0,
    payment_status: "unpaid",
    voided_at: new Date().toISOString(),
    refunded_at: null,
    refund_reason: null,
    cash_drawer_start_amount: null,
    cash_drawer_end_amount: null,
    cash_in_amount: null,
    cash_out_amount: null,
    z_report_printed_at: null,
    order_type: "retail",
    shipping_address: null,
    shipping_cost: 0,
    shipping_city: null,
    order_items: [
      {
        id: "oi_003_1",
        order_id: "ord_003",
        product_id: "prod_004",
        name: "Latte Art Pitcher",
        quantity: 1,
        price: 25.0,
        discount: 0,
        created_at: new Date().toISOString(),
        total: 25.0,
      },
      {
        id: "oi_003_2",
        order_id: "ord_003",
        product_id: "prod_005",
        name: "Digital Coffee Scale",
        quantity: 1,
        price: 45.0,
        discount: 5.0,
        created_at: new Date().toISOString(),
        total: 40.0,
      },
    ],
  },
]

export const getOrders = async (storeId: string, date?: Date): Promise<Order[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  let orders = DUMMY_ORDERS

  if (date) {
    const targetDate = date.toDateString()
    orders = orders.filter((order) => new Date(order.created_at).toDateString() === targetDate)
  }

  // In a real application, you would filter by storeId
  // For this dummy implementation, we'll just return all orders.
  console.log(`Fetching orders for storeId: ${storeId} and date: ${date?.toISOString() || "any"}`)

  return orders
}
