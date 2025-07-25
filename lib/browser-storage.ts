// Import the types from the Supabase file to maintain compatibility
import type { Product, Customer, Order, OrderItem, Category, DeliveryProvider } from "@/lib/supabase"

// Helper function to generate UUIDs
function generateUUID(): string {
  return crypto.randomUUID()
}

// Helper function to get current ISO timestamp
function getCurrentTimestamp(): string {
  return new Date().toISOString()
}

// Helper functions for localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const storedValue = localStorage.getItem(key)
    return storedValue ? JSON.parse(storedValue) : defaultValue
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error)
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
  }
}

// Storage keys
const STORAGE_KEYS = {
  PRODUCTS: 'pos_products',
  CUSTOMERS: 'pos_customers',
  ORDERS: 'pos_orders',
  ORDER_ITEMS: 'pos_order_items',
  CATEGORIES: 'pos_categories',
  DELIVERY_PROVIDERS: 'pos_delivery_providers'
}

// Default data for initial setup
const defaultProducts: Product[] = [
  {
    id: "SLS2-001",
    name: "Surface Laptop Studio 2",
    price: 2499.99,
    image: "💻",
    category: "Surface",
    stock: 10,
    sku: "SLS2-001",
  },
  {
    id: "SP9-001",
    name: "Surface Pro 9",
    price: 1299.0,
    image: "💻",
    category: "Surface",
    stock: 15,
    sku: "SP9-001",
  },
  {
    id: "SG3-001",
    name: "Surface Go 3",
    price: 549.0,
    image: "💻",
    category: "Surface",
    stock: 20,
    sku: "SG3-001",
  },
  {
    id: "SH2-001",
    name: "Surface Headphones 2",
    price: 249.0,
    image: "🎧",
    category: "Accessories",
    stock: 30,
    sku: "SH2-001",
  },
]

const defaultCustomers: Customer[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Guest",
    email: "",
    phone: "",
    address: "",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "John Smith",
    email: "john@example.com",
    phone: "123-456-7890",
    address: "123 Main St, Baghdad",
  },
]

const defaultCategories: Category[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Surface",
    created_at: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Accessories",
    created_at: "2025-01-01T00:00:00.000Z",
  },
]

// Initialize storage with default data if empty
function initializeStorage(): void {
  // Only initialize if storage is empty
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    saveToStorage(STORAGE_KEYS.PRODUCTS, defaultProducts)
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    saveToStorage(STORAGE_KEYS.CUSTOMERS, defaultCustomers)
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    saveToStorage(STORAGE_KEYS.ORDERS, [])
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.ORDER_ITEMS)) {
    saveToStorage(STORAGE_KEYS.ORDER_ITEMS, [])
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    saveToStorage(STORAGE_KEYS.CATEGORIES, defaultCategories)
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.DELIVERY_PROVIDERS)) {
    saveToStorage(STORAGE_KEYS.DELIVERY_PROVIDERS, [])
  }
}

// Browser storage operations that mimic Supabase operations
export const getBrowserStorageOperations = () => {
  // Initialize storage if needed
  if (typeof window !== 'undefined') {
    initializeStorage()
  }

  return {
    isOnline: true, // Always online since we're using local storage
    
    // Products
    getProducts: async () => {
      const products = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, [])
      return { data: products, error: null }
    },
    
    addProduct: async (product: Product) => {
      const products = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, [])
      // Ensure product has an ID
      if (!product.id) {
        product.id = generateUUID()
      }
      products.push(product)
      saveToStorage(STORAGE_KEYS.PRODUCTS, products)
      return { data: product, error: null }
    },
    
    updateProduct: async (product: Product) => {
      const products = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, [])
      const index = products.findIndex(p => p.id === product.id)
      if (index !== -1) {
        products[index] = product
        saveToStorage(STORAGE_KEYS.PRODUCTS, products)
        return { data: product, error: null }
      }
      return { data: null, error: new Error("Product not found") }
    },
    
    deleteProduct: async (id: string) => {
      const products = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, [])
      const filteredProducts = products.filter(p => p.id !== id)
      saveToStorage(STORAGE_KEYS.PRODUCTS, filteredProducts)
      return { error: null }
    },
    
    deleteMultipleProducts: async (ids: string[]) => {
      const products = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, [])
      const filteredProducts = products.filter(p => !ids.includes(p.id))
      saveToStorage(STORAGE_KEYS.PRODUCTS, filteredProducts)
      return { error: null }
    },
    
    // Customers
    getCustomers: async () => {
      const customers = getFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, [])
      return { data: customers, error: null }
    },
    
    addCustomer: async (customer: Customer) => {
      const customers = getFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, [])
      // Ensure customer has an ID
      if (!customer.id) {
        customer.id = generateUUID()
      }
      customers.push(customer)
      saveToStorage(STORAGE_KEYS.CUSTOMERS, customers)
      return { data: customer, error: null }
    },
    
    updateCustomer: async (customer: Customer) => {
      const customers = getFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, [])
      const index = customers.findIndex(c => c.id === customer.id)
      if (index !== -1) {
        customers[index] = customer
        saveToStorage(STORAGE_KEYS.CUSTOMERS, customers)
        return { data: customer, error: null }
      }
      return { data: null, error: new Error("Customer not found") }
    },
    
    deleteCustomer: async (id: string) => {
      const customers = getFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, [])
      const filteredCustomers = customers.filter(c => c.id !== id)
      saveToStorage(STORAGE_KEYS.CUSTOMERS, filteredCustomers)
      return { error: null }
    },
    
    // Orders
    getOrders: async () => {
      const orders = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, [])
      // Sort by created_at in descending order
      orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      return { data: orders, error: null }
    },
    
    addOrder: async (order: Omit<Order, "created_at">, items: Omit<OrderItem, "id" | "order_id">[]) => {
      // Add created_at timestamp
      const newOrder: Order = {
        ...order,
        created_at: getCurrentTimestamp()
      }
      
      // Save order
      const orders = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, [])
      orders.push(newOrder)
      saveToStorage(STORAGE_KEYS.ORDERS, orders)
      
      // Save order items
      const orderItems = getFromStorage<OrderItem[]>(STORAGE_KEYS.ORDER_ITEMS, [])
      const newOrderItems = items.map(item => ({
        ...item,
        id: generateUUID(),
        order_id: newOrder.id,
        created_at: getCurrentTimestamp()
      }))
      
      orderItems.push(...newOrderItems)
      saveToStorage(STORAGE_KEYS.ORDER_ITEMS, orderItems)
      
      return { data: newOrder, error: null }
    },
    
    getOrderItems: async (orderId: string) => {
      const orderItems = getFromStorage<OrderItem[]>(STORAGE_KEYS.ORDER_ITEMS, [])
      const filteredItems = orderItems.filter(item => item.order_id === orderId)
      return { data: filteredItems, error: null }
    },
    
    updateOrderStatus: async (orderId: string, status: string, timestampField: "voided_at" | "refunded_at") => {
      const orders = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, [])
      const index = orders.findIndex(o => o.id === orderId)
      
      if (index !== -1) {
        const updateData: Partial<Order> = { status }
        if (timestampField) {
          updateData[timestampField] = getCurrentTimestamp()
        }
        
        orders[index] = { ...orders[index], ...updateData }
        saveToStorage(STORAGE_KEYS.ORDERS, orders)
        
        return { data: orders[index], error: null }
      }
      
      return { data: null, error: new Error("Order not found") }
    },
    
    refundOrder: async (orderId: string, refundAmount: number, reason: string) => {
      const orders = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, [])
      const index = orders.findIndex(o => o.id === orderId)
      
      if (index !== -1) {
        orders[index] = {
          ...orders[index],
          status: "refunded",
          payment_status: "refunded",
          refunded_at: getCurrentTimestamp(),
          refund_reason: reason
        }
        
        saveToStorage(STORAGE_KEYS.ORDERS, orders)
        return { data: orders[index], error: null }
      }
      
      return { data: null, error: new Error("Order not found") }
    },
    
    deleteOrder: async (id: string) => {
      // Delete order
      const orders = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, [])
      const filteredOrders = orders.filter(o => o.id !== id)
      saveToStorage(STORAGE_KEYS.ORDERS, filteredOrders)
      
      // Delete associated order items
      const orderItems = getFromStorage<OrderItem[]>(STORAGE_KEYS.ORDER_ITEMS, [])
      const filteredOrderItems = orderItems.filter(item => item.order_id !== id)
      saveToStorage(STORAGE_KEYS.ORDER_ITEMS, filteredOrderItems)
      
      return { error: null }
    },
    
    // Categories
    getCategories: async () => {
      const categories = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, [])
      return { data: categories, error: null }
    },
    
    addCategory: async (category: Omit<Category, "id" | "created_at">) => {
      const newCategory: Category = {
        ...category,
        id: generateUUID(),
        created_at: getCurrentTimestamp()
      }
      
      const categories = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, [])
      categories.push(newCategory)
      saveToStorage(STORAGE_KEYS.CATEGORIES, categories)
      
      return { data: newCategory, error: null }
    },
    
    // Delivery Providers
    getDeliveryProviders: async () => {
      const providers = getFromStorage<DeliveryProvider[]>(STORAGE_KEYS.DELIVERY_PROVIDERS, [])
      return { data: providers, error: null }
    },
    
    addDeliveryProvider: async (provider: Omit<DeliveryProvider, "created_at">) => {
      const newProvider: DeliveryProvider = {
        ...provider,
        created_at: getCurrentTimestamp()
      }
      
      const providers = getFromStorage<DeliveryProvider[]>(STORAGE_KEYS.DELIVERY_PROVIDERS, [])
      providers.push(newProvider)
      saveToStorage(STORAGE_KEYS.DELIVERY_PROVIDERS, providers)
      
      return { data: newProvider, error: null }
    },
    
    updateDeliveryProvider: async (provider: DeliveryProvider) => {
      const providers = getFromStorage<DeliveryProvider[]>(STORAGE_KEYS.DELIVERY_PROVIDERS, [])
      const index = providers.findIndex(p => p.id === provider.id)
      
      if (index !== -1) {
        providers[index] = provider
        saveToStorage(STORAGE_KEYS.DELIVERY_PROVIDERS, providers)
        return { data: provider, error: null }
      }
      
      return { data: null, error: new Error("Delivery provider not found") }
    },
    
    deleteDeliveryProvider: async (id: string) => {
      const providers = getFromStorage<DeliveryProvider[]>(STORAGE_KEYS.DELIVERY_PROVIDERS, [])
      const filteredProviders = providers.filter(p => p.id !== id)
      saveToStorage(STORAGE_KEYS.DELIVERY_PROVIDERS, filteredProviders)
      return { error: null }
    },
  }
}