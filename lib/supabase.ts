import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"
import { cookies } from "next/headers"
import { cache } from "react"

// Client-side Supabase client (singleton pattern)
let supabaseBrowserClient: ReturnType<typeof createClient> | null = null

export function createBrowserSupabaseClient() {
  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return supabaseBrowserClient
}

// Server-side Supabase client for Route Handlers and Server Components
export const createServerSupabaseClient = cache(() => {
  const cookieStore = cookies()
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `cookies().set()` method can only be called in a Server Context.
          // We're only calling this when rendering a Server Component, an RSC,
          // or an API route. This error is safe to ignore.
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // The `cookies().set()` method can only be called in a Server Context.
          // We're only calling this when rendering a Server Component, an RSC,
          // or an API route. This error is safe to ignore.
        }
      },
    },
  })
})

// Database operations for convenience
export const dbOperations = {
  getProducts: async () => {
    const supabase = createBrowserSupabaseClient()
    return supabase.from("products").select("*").order("name", { ascending: true })
  },
  addProduct: async (
    product: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at">,
  ) => {
    const supabase = createBrowserSupabaseClient()
    return supabase.from("products").insert(product).select().single()
  },
  updateProduct: async (
    id: string,
    product: Partial<Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at">>,
  ) => {
    const supabase = createBrowserSupabaseClient()
    return supabase.from("products").update(product).eq("id", id).select().single()
  },
  deleteProduct: async (id: string) => {
    const supabase = createBrowserSupabaseClient()
    return supabase.from("products").delete().eq("id", id)
  },
  getCategories: async () => {
    const supabase = createBrowserSupabaseClient()
    return supabase.from("categories").select("*").order("name", { ascending: true })
  },
  addCategory: async (name: string) => {
    const supabase = createBrowserSupabaseClient()
    return supabase.from("categories").insert({ name }).select().single()
  },
  getCustomers: async () => {
    const supabase = createBrowserSupabaseClient()
    return supabase.from("customers").select("*").order("name", { ascending: true })
  },
  addCustomer: async (
    customer: Omit<Database["public"]["Tables"]["customers"]["Row"], "id" | "created_at" | "updated_at">,
  ) => {
    const supabase = createBrowserSupabaseClient()
    return supabase.from("customers").insert(customer).select().single()
  },
  updateCustomer: async (
    id: string,
    customer: Partial<Omit<Database["public"]["Tables"]["customers"]["Row"], "id" | "created_at" | "updated_at">>,
  ) => {
    const supabase = createBrowserSupabaseClient()
    return supabase.from("customers").update(customer).eq("id", id).select().single()
  },
  getOrders: async () => {
    const supabase = createBrowserSupabaseClient()
    return supabase
      .from("orders")
      .select(`
      *,
      order_items (
        id,
        product_id,
        name,
        quantity,
        price,
        discount
      )
    `)
      .order("created_at", { ascending: false })
  },
  updateOrderStatus: async (id: string, status: Database["public"]["Tables"]["orders"]["Row"]["status"]) => {
    const supabase = createBrowserSupabaseClient()
    return supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id)
  },
  getSettings: async () => {
    const supabase = createBrowserSupabaseClient()
    return supabase.from("settings").select("*").single()
  },
  updateSettings: async (id: string, settings: Partial<Database["public"]["Tables"]["settings"]["Row"]>) => {
    const supabase = createBrowserSupabaseClient()
    return supabase.from("settings").update(settings).eq("id", id).select().single()
  },
  getDeliveryProviders: async () => {
    const supabase = createBrowserSupabaseClient()
    // Assuming delivery providers are stored within the settings table as JSONB
    // This function would need to fetch settings and parse the delivery_providers array
    const { data, error } = await supabase.from("settings").select("delivery_providers").single()
    if (error) {
      console.error("Error fetching delivery providers from settings:", error)
      return { data: [], error }
    }
    return { data: data?.delivery_providers || [], error: null }
  },
}

// Type exports for convenience
export type Product = Database["public"]["Tables"]["products"]["Row"]
export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type Customer = Database["public"]["Tables"]["customers"]["Row"]
export type Order = Database["public"]["Tables"]["orders"]["Row"] & { order_items?: OrderItem[] }
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]
export type SettingsRow = Database["public"]["Tables"]["settings"]["Row"]
export type DeliveryProvider = { id: string; name: string; cost_per_km: number }
