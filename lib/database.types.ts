export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

/* ----- Minimal tables used by the POS UI ----- */

export interface Product {
  id: string
  name: string
  price: number
  sku: string | null
  category: string | null
  image: string | null
  created_at?: string
  updated_at?: string
}

export interface Category {
  id: string
  name: string
  created_at?: string
}

export interface Customer {
  id: string
  name: string
  email: string | null
  created_at?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  name: string
  quantity: number
  price: number
  discount: number
  created_at?: string
}

export interface Order {
  id: string
  store_id: string | null
  customer_id: string | null
  customer_name: string | null
  status: string
  total: number
  created_at?: string
  updated_at?: string
  order_items?: OrderItem[]
}

export interface SettingsRow {
  id: string
  taxRate: number
  currencySymbol: string
  decimalPlaces: number
  shipping: { enabled: boolean }
  paymentMethods?: { id: string; isPaid: boolean }[]
  receiptPrinterEnabled?: boolean
  delivery_providers?: Json
}

export interface Database {
  public: {
    Tables: {
      products: { Row: Product }
      categories: { Row: Category }
      customers: { Row: Customer }
      orders: { Row: Order }
      order_items: { Row: OrderItem }
      settings: { Row: SettingsRow }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
