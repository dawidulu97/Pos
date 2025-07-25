import { createClient } from "@supabase/supabase-js"

// Define your database types for better type safety
// You would typically generate these using `supabase gen types typescript --schema public > types/supabase.ts`
// For now, we'll define basic types manually.
export interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  stock: number
  sku: string
}

export interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
}

export interface Order {
  id: string
  customer_id: string | null
  customer_name: string | null
  total_amount: number
  total_discount: number
  total_fees: number
  amount_paid: number
  change_due: number
  payment_method: string
  status: string // e.g., 'completed', 'pending', 'voided', 'refunded'
  notes: string | null
  created_at: string // ISO timestamp
  shipping_address: string | null
  shipping_cost: number
  delivery_provider_id: string | null
  delivery_provider_name: string | null
  order_type: string // 'retail' or 'delivery'
  payment_status: string // 'paid', 'partially_paid', 'unpaid', 'refunded'
  voided_at: string | null
  refunded_at: string | null
  refund_reason: string | null
  cash_drawer_start_amount: number | null
  cash_drawer_end_amount: number | null
  cash_in_amount: number | null
  cash_out_amount: number | null
  z_report_printed_at: string | null
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  discount: number // Percentage discount
  created_at: string
}

export interface Category {
  id: string
  name: string
  created_at: string
}

export interface DeliveryProvider {
  id: string
  name: string
  contact_phone: string | null
  contact_email: string | null
  is_active: boolean
  created_at: string
}

// Function to create a Supabase client for client-side operations
// Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "Supabase environment variables are not set. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.",
    )
    return null
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Function to create a Supabase client for server-side operations
// Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY for RLS-enabled server actions)
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn(
      "Supabase environment variables for server are not set. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
    )
    return null
  }

  // Use service_role key for elevated privileges on the server
  return createClient(supabaseUrl, supabaseServiceRoleKey)
}

// Helper for database operations
export const getDbOperations = (supabaseClient: ReturnType<typeof createBrowserSupabaseClient>) => {
  if (!supabaseClient) {
    console.error("Supabase client is not initialized. Database operations are unavailable.")
    return {
      isOnline: false,
      getProducts: async () => ({ data: [], error: new Error("Supabase client not initialized") }),
      addProduct: async (product: Product) => ({ data: null, error: new Error("Supabase client not initialized") }),
      updateProduct: async (product: Product) => ({ data: null, error: new Error("Supabase client not initialized") }),
      deleteProduct: async (id: string) => ({ error: new Error("Supabase client not initialized") }),
      deleteMultipleProducts: async (ids: string[]) => ({ error: new Error("Supabase client not initialized") }),
      getCustomers: async () => ({ data: [], error: new Error("Supabase client not initialized") }),
      addCustomer: async (customer: Customer) => ({ data: null, error: new Error("Supabase client not initialized") }),
      updateCustomer: async (customer: Customer) => ({
        data: null,
        error: new Error("Supabase client not initialized"),
      }),
      deleteCustomer: async (id: string) => ({ error: new Error("Supabase client not initialized") }),
      getOrders: async () => ({ data: [], error: new Error("Supabase client not initialized") }),
      addOrder: async (order: Omit<Order, "created_at">, items: Omit<OrderItem, "id" | "order_id">[]) => ({
        data: null,
        error: new Error("Supabase client not initialized"),
      }),
      getOrderItems: async (orderId: string) => ({ data: [], error: new Error("Supabase client not initialized") }),
      updateOrderStatus: async (orderId: string, status: string, timestampField: "voided_at" | "refunded_at") => ({
        data: null,
        error: new Error("Supabase client not initialized"),
      }),
      refundOrder: async (orderId: string, refundAmount: number, reason: string) => ({
        data: null,
        error: new Error("Supabase client not initialized"),
      }),
      deleteOrder: async (id: string) => ({ error: new Error("Supabase client not initialized") }),
      getCategories: async () => ({ data: [], error: new Error("Supabase client not initialized") }),
      addCategory: async (category: Omit<Category, "id" | "created_at">) => ({
        data: null,
        error: new Error("Supabase client not initialized"),
      }),
      getDeliveryProviders: async () => ({ data: [], error: new Error("Supabase client not initialized") }),
      addDeliveryProvider: async (provider: Omit<DeliveryProvider, "created_at">) => ({
        data: null,
        error: new Error("Supabase client not initialized"),
      }),
      updateDeliveryProvider: async (provider: DeliveryProvider) => ({
        data: null,
        error: new Error("Supabase client not initialized"),
      }),
      deleteDeliveryProvider: async (id: string) => ({ error: new Error("Supabase client not initialized") }),
    }
  }

  return {
    isOnline: true,
    getProducts: async () => {
      const { data, error } = await supabaseClient.from("products").select("*")
      return { data: data as Product[], error }
    },
    addProduct: async (product: Product) => {
      const { data, error } = await supabaseClient.from("products").insert([product]).select().single()
      return { data: data as Product, error }
    },
    updateProduct: async (product: Product) => {
      const { data, error } = await supabaseClient
        .from("products")
        .update(product)
        .eq("id", product.id)
        .select()
        .single()
      return { data: data as Product, error }
    },
    deleteProduct: async (id: string) => {
      const { error } = await supabaseClient.from("products").delete().eq("id", id)
      return { error }
    },
    deleteMultipleProducts: async (ids: string[]) => {
      const { error } = await supabaseClient.from("products").delete().in("id", ids)
      return { error }
    },
    getCustomers: async () => {
      const { data, error } = await supabaseClient.from("customers").select("*")
      return { data: data as Customer[], error }
    },
    addCustomer: async (customer: Customer) => {
      const { data, error } = await supabaseClient.from("customers").insert([customer]).select().single()
      return { data: data as Customer, error }
    },
    updateCustomer: async (customer: Customer) => {
      const { data, error } = await supabaseClient
        .from("customers")
        .update(customer)
        .eq("id", customer.id)
        .select()
        .single()
      return { data: data as Customer, error }
    },
    deleteCustomer: async (id: string) => {
      const { error } = await supabaseClient.from("customers").delete().eq("id", id)
      return { error }
    },
    getOrders: async () => {
      const { data, error } = await supabaseClient.from("orders").select("*").order("created_at", { ascending: false })
      return { data: data as Order[], error }
    },
    addOrder: async (order: Omit<Order, "created_at">, items: Omit<OrderItem, "id" | "order_id">[]) => {
      const { data: addedOrder, error: orderError } = await supabaseClient
        .from("orders")
        .insert([order])
        .select()
        .single()
      if (orderError) return { data: null, error: orderError }

      const orderItemsWithOrderId = items.map((item) => ({
        ...item,
        id: item.id || crypto.randomUUID(), // Ensure item has an ID
        order_id: addedOrder.id,
      }))

      const { error: itemsError } = await supabaseClient.from("order_items").insert(orderItemsWithOrderId)
      return { data: addedOrder as Order, error: itemsError }
    },
    getOrderItems: async (orderId: string) => {
      const { data, error } = await supabaseClient.from("order_items").select("*").eq("order_id", orderId)
      return { data: data as OrderItem[], error }
    },
    updateOrderStatus: async (orderId: string, status: string, timestampField: "voided_at" | "refunded_at") => {
      const updateData: Partial<Order> = { status }
      if (timestampField) {
        updateData[timestampField] = new Date().toISOString()
      }
      const { data, error } = await supabaseClient.from("orders").update(updateData).eq("id", orderId).select().single()
      return { data: data as Order, error }
    },
    refundOrder: async (orderId: string, refundAmount: number, reason: string) => {
      // This is a simplified refund. In a real app, you'd handle partial refunds,
      // payment gateway integration, etc.
      const { data, error } = await supabaseClient
        .from("orders")
        .update({
          status: "refunded",
          payment_status: "refunded",
          refunded_at: new Date().toISOString(),
          refund_reason: reason,
          // For partial refunds, you might adjust amount_paid or add a refund_amount field
          // For simplicity, we're marking as fully refunded here.
        })
        .eq("id", orderId)
        .select()
        .single()
      return { data: data as Order, error }
    },
    deleteOrder: async (id: string) => {
      const { error } = await supabaseClient.from("orders").delete().eq("id", id)
      return { error }
    },
    getCategories: async () => {
      const { data, error } = await supabaseClient.from("categories").select("*")
      return { data: data as Category[], error }
    },
    addCategory: async (category: Omit<Category, "id" | "created_at">) => {
      const newCategory = { ...category, id: crypto.randomUUID() }
      const { data, error } = await supabaseClient.from("categories").insert([newCategory]).select().single()
      return { data: data as Category, error }
    },
    getDeliveryProviders: async () => {
      const { data, error } = await supabaseClient.from("delivery_providers").select("*")
      return { data: data as DeliveryProvider[], error }
    },
    addDeliveryProvider: async (provider: Omit<DeliveryProvider, "created_at">) => {
      const newProvider = { ...provider, id: crypto.randomUUID() }
      const { data, error } = await supabaseClient.from("delivery_providers").insert([newProvider]).select().single()
      return { data: data as DeliveryProvider, error }
    },
    updateDeliveryProvider: async (provider: DeliveryProvider) => {
      const { data, error } = await supabaseClient
        .from("delivery_providers")
        .update(provider)
        .eq("id", provider.id)
        .select()
        .single()
      return { data: data as DeliveryProvider, error }
    },
    deleteDeliveryProvider: async (id: string) => {
      const { error } = await supabaseClient.from("delivery_providers").delete().eq("id", id)
      return { error }
    },
  }
}
