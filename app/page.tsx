"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Truck,
  FileText,
  Percent,
  DollarSign,
  Search,
  Plus,
  Minus,
  Cloud,
  Bell,
  Settings,
  Wifi,
  Share2,
  ClipboardList,
  Wallet,
  Receipt,
  Users,
  QrCode,
  Tag,
  Trash2,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Import Supabase and database operations
import type { Product, Customer, Order, OrderItem, DeliveryProvider } from "@/lib/supabase"

// Import all the modal components
import { CustomerModal } from "@/components/customer-modal"
import { ShippingModal } from "@/components/shipping-modal"
import { NoteModal } from "@/components/note-modal"
import { DiscountModal } from "@/components/discount-modal"
import { FeeModal } from "@/components/fee-modal"
import { RefundModal } from "@/components/refund-modal"
import { ProductModal } from "@/components/product-modal"
import { PaymentModal } from "@/components/payment-modal"
import { LoadModal } from "@/components/load-modal"
import { OrdersModal } from "@/components/orders-modal"
import { CashManagementModal } from "@/components/cash-management-modal"
import { QrCodeModal } from "@/components/qr-code-modal"
import { QrScannerModal } from "@/components/qr-scanner-modal"
import { useSettings } from "@/lib/settings-context" // Import useSettings
import { formatCurrency, calculateTotal } from "@/lib/utils" // Import formatCurrency
import { toast } from "@/hooks/use-toast"
import { printReceipt } from "@/lib/receipt-printer"
import { useSupabase } from "@/lib/supabase-context"
import Link from "next/link"

interface CartItem extends Product {
  quantity: number
  discount?: number // Percentage discount
  note?: string
}

// Default/fallback data
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
    address: "123 Main St, Baghdad", // Example address with city
  },
]

export default function POSApp() {
  const { dbOperations } = useSupabase()
  const { settings } = useSettings()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [deliveryProviders, setDeliveryProviders] = useState<DeliveryProvider[]>([])

  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [orderNotes, setOrderNotes] = useState<string>("")
  const [orderFees, setOrderFees] = useState<{ description: string; amount: number }[]>([])
  const [totalOrderDiscountPercentage, setTotalOrderDiscountPercentage] = useState<number>(0)
  const [currentCashInDrawer, setCurrentCashInDrawer] = useState<number>(0)
  const [shippingDetails, setShippingDetails] = useState<{
    address: string
    cost: number
    provider?: DeliveryProvider
  } | null>(null)

  const [loading, setLoading] = useState(true) // Declare the loading variable

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false)
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [orderToRefund, setOrderToRefund] = useState<Order | null>(null)
  const [isCashManagementModalOpen, setIsCashManagementModalOpen] = useState(false)
  const [isQrScannerModalOpen, setIsQrScannerModalOpen] = useState(false)
  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false)
  const [productForQrCode, setProductForQrCode] = useState<Product | null>(null)
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false)
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false)
  const [showVoidConfirmationModal, setShowVoidConfirmationModal] = useState(false) // New state for void confirmation
  const [orderToVoid, setOrderToVoid] = useState<string | null>(null) // State to hold order ID to void

  // Ref for the audio element
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Function to play a subtle success sound
  const playSuccessSound = useCallback(() => {
    console.log("Attempting to play notification sound...")
    if (audioRef.current) {
      audioRef.current.volume = 0.3 // Set volume to 30%
      audioRef.current.play().catch((e) => console.error("Error playing notification sound:", e))
    } else {
      console.warn("Audio element not available for playback.")
    }
  }, [])

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: productsData, error: productsError } = await dbOperations.getProducts()
      if (productsError) console.error("Error fetching products:", productsError)
      setProducts(productsData || [])

      const { data: categoriesData, error: categoriesError } = await dbOperations.getCategories()
      if (categoriesError) console.error("Error fetching categories:", categoriesError)
      // ---- categories fallback handling ----
      if (!categoriesError && categoriesData?.length) {
        // Normal case – the table exists and returned rows
        setCategories(categoriesData.map((c) => c.name))
      } else {
        // Fallback – table missing OR returned empty → derive from products
        const derived = new Set<string>()
        ;(productsData || []).forEach((p) => derived.add(p.category))
        setCategories(Array.from(derived))
        if (categoriesError) {
          console.warn(
            "Categories table missing – derived categories from products instead. " +
              "(Run the categories migration to create the table.)",
          )
        }
      }
      // --------------------------------------

      const { data: customersData, error: customersError } = await dbOperations.getCustomers()
      if (customersError) console.error("Error fetching customers:", customersError)
      setCustomers(customersData || [])
      // Set selected customer to "Guest" or first customer if available
      setSelectedCustomer(
        (customersData || []).find((c) => c.name === "Guest") || (customersData || [])[0] || defaultCustomers[0],
      )

      const { data: ordersData, error: ordersError } = await dbOperations.getOrders()
      if (ordersError) console.error("Error fetching orders:", ordersError)
      setOrders(ordersData || [])

      const { data: providersData, error: providersError } = await dbOperations.getDeliveryProviders()
      if (providersError) console.error("Error fetching delivery providers:", providersError)
      setDeliveryProviders(providersData || [])
    }
    fetchData().finally(() => setLoading(false)) // Set loading to false after fetching data
  }, [dbOperations])

  // Cart calculations
  const { subtotal, total, taxAmount, totalDiscountAmount, totalFeesAmount } = useMemo(() => {
    return calculateTotal(cart, settings.taxRate, orderFees, totalOrderDiscountPercentage)
  }, [cart, settings.taxRate, orderFees, totalOrderDiscountPercentage])

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        (selectedCategory === null || product.category === selectedCategory) &&
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [products, selectedCategory, searchTerm])

  const handleAddToCart = useCallback(
    (product: Product) => {
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === product.id)
        if (existingItem) {
          return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
        } else {
          return [...prevCart, { ...product, quantity: 1 }]
        }
      })
      playSuccessSound()
    },
    [playSuccessSound],
  )

  const handleUpdateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = item.quantity + delta
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    })
  }, [])

  const handleRemoveFromCart = useCallback((productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }, [])

  const handleClearCart = useCallback(() => {
    setCart([])
    setSelectedCustomer(customers.find((c) => c.name === "Guest") || defaultCustomers[0])
    setOrderNotes("")
    setOrderFees([])
    setTotalOrderDiscountPercentage(0)
    setShippingDetails(null)
  }, [customers])

  const handleProductSaved = useCallback(
    async (product: Product) => {
      if (products.some((p) => p.id === product.id)) {
        // Update existing product
        const { data, error } = await dbOperations.updateProduct(product)
        if (error) {
          console.error("Error updating product:", error)
          toast({
            title: "Error",
            description: `Failed to update product: ${error.message}`,
            variant: "destructive",
          })
        } else {
          setProducts((prev) => prev.map((p) => (p.id === product.id ? data! : p)))
          toast({
            title: "Product Updated",
            description: `${product.name} has been updated.`,
          })
        }
      } else {
        // Add new product
        const { data, error } = await dbOperations.addProduct(product)
        if (error) {
          console.error("Error adding product:", error)
          toast({
            title: "Error",
            description: `Failed to add product: ${error.message}`,
            variant: "destructive",
          })
        } else {
          setProducts((prev) => [...prev, data!])
          toast({
            title: "Product Added",
            description: `${product.name} has been added.`,
          })
        }
      }
    },
    [products, dbOperations],
  )

  const handleDeleteProduct = useCallback(
    async (productIds: string[]) => {
      const { error } = await dbOperations.deleteMultipleProducts(productIds)
      if (error) {
        console.error("Error deleting products:", error)
        toast({
          title: "Error",
          description: `Failed to delete products: ${error.message}`,
          variant: "destructive",
        })
      } else {
        setProducts((prev) => prev.filter((p) => !productIds.includes(p.id)))
        setCart((prev) => prev.filter((item) => !productIds.includes(item.id))) // Also remove from cart if deleted
        toast({
          title: "Products Deleted",
          description: `${productIds.length} product(s) have been removed.`,
          variant: "destructive", // Red notification for deletion
        })
        const deleteAudio = document.getElementById("delete-sound") as HTMLAudioElement
        deleteAudio?.play().catch(() => {})
      }
    },
    [dbOperations],
  )

  const handleAddCategory = useCallback(
    async (newCategory: string) => {
      const { error } = await dbOperations.addCategory({ name: newCategory })
      if (error) {
        console.error("Error adding category:", error)
        toast({
          title: "Error",
          description: `Failed to add category: ${error.message}`,
          variant: "destructive",
        })
      } else {
        setCategories((prev) => [...prev, newCategory])
        toast({
          title: "Category Added",
          description: `${newCategory} has been added.`,
        })
      }
    },
    [dbOperations],
  )

  const handleCustomerSaved = useCallback(
    async (customer: Customer) => {
      if (customers.some((c) => c.id === customer.id)) {
        // Update existing customer
        const { data, error } = await dbOperations.updateCustomer(customer)
        if (error) {
          console.error("Error updating customer:", error)
          toast({
            title: "Error",
            description: `Failed to update customer: ${error.message}`,
            variant: "destructive",
          })
        } else {
          setCustomers((prev) => prev.map((c) => (c.id === customer.id ? data! : c)))
          setSelectedCustomer(data)
          toast({
            title: "Customer Updated",
            description: `${customer.name} has been updated.`,
          })
        }
      } else {
        // Add new customer
        const { data, error } = await dbOperations.addCustomer(customer)
        if (error) {
          console.error("Error adding customer:", error)
          toast({
            title: "Error",
            description: `Failed to add customer: ${error.message}`,
            variant: "destructive",
          })
        } else {
          setCustomers((prev) => [...prev, data!])
          setSelectedCustomer(data)
          toast({
            title: "Customer Added",
            description: `${customer.name} has been added.`,
          })
        }
      }
    },
    [customers, dbOperations],
  )

  const handleDeleteCustomer = useCallback(
    async (customerId: string) => {
      const { error } = await dbOperations.deleteCustomer(customerId)
      if (error) {
        console.error("Error deleting customer:", error)
        toast({
          title: "Error",
          description: `Failed to delete customer: ${error.message}`,
          variant: "destructive",
        })
      } else {
        setCustomers((prev) => prev.filter((c) => c.id !== customerId))
        if (selectedCustomer?.id === customerId) {
          setSelectedCustomer(customers.find((c) => c.name === "Guest") || defaultCustomers[0])
        }
        toast({
          title: "Customer Deleted",
          description: "Customer has been removed.",
        })
      }
    },
    [dbOperations, selectedCustomer, customers],
  )

  const handleApplyItemDiscount = useCallback(
    (productId: string, discount: number) => {
      setCart((prevCart) => prevCart.map((item) => (item.id === productId ? { ...item, discount: discount } : item)))
      toast({
        title: "Discount Applied",
        description: `Discount of ${formatCurrency(discount, settings.currencySymbol, settings.decimalPlaces)} applied to item.`,
      })
    },
    [settings.currencySymbol, settings.decimalPlaces],
  )

  const handleApplyTotalDiscount = useCallback((discountPercentage: number) => {
    setTotalOrderDiscountPercentage(discountPercentage)
    toast({
      title: "Total Discount Applied",
      description: `${discountPercentage}% discount applied to the total order.`,
    })
  }, [])

  const handleSaveFees = useCallback((fees: { description: string; amount: number }[]) => {
    setOrderFees(fees)
    toast({
      title: "Fees Updated",
      description: "Additional fees have been applied to the order.",
    })
  }, [])

  const handleSaveNotes = useCallback((notes: string) => {
    setOrderNotes(notes)
    toast({
      title: "Notes Updated",
      description: "Order notes have been saved.",
    })
  }, [])

  const handleSaveShipping = useCallback((details: { address: string; cost: number; provider?: DeliveryProvider }) => {
    setShippingDetails(details)
    toast({
      title: "Shipping Details Saved",
      description: "Shipping information has been added to the order.",
    })
  }, [])

  const handleProcessPayment = useCallback(
    async (
      paymentMethod: string,
      amountPaid: number,
      changeDue: number,
      shippingDetails?: { address: string; cost: number; provider?: DeliveryProvider },
    ) => {
      if (cart.length === 0) {
        toast({
          title: "Cart is Empty",
          description: "Please add items to the cart before processing payment.",
          variant: "destructive",
        })
        return
      }

      const newOrder: Omit<Order, "created_at"> = {
        id: `order-${Date.now()}`,
        customer_id: selectedCustomer?.id || null,
        customer_name: selectedCustomer?.name || null,
        total_amount: total,
        total_discount: totalDiscountAmount,
        total_fees: totalFeesAmount,
        amount_paid: amountPaid,
        change_due: changeDue,
        payment_method: paymentMethod,
        status: "completed",
        notes: orderNotes || null,
        shipping_address: shippingDetails?.address || null,
        shipping_cost: shippingDetails?.cost || 0,
        delivery_provider_id: shippingDetails?.provider?.id || null,
        delivery_provider_name: shippingDetails?.provider?.name || null,
        order_type: shippingDetails?.address ? "delivery" : "retail", // Determine order type
        payment_status: "paid",
        voided_at: null,
        refunded_at: null,
        refund_reason: null,
        cash_drawer_start_amount: null, // These will be updated by cash management
        cash_drawer_end_amount: null,
        cash_in_amount: null,
        cash_out_amount: null,
        z_report_printed_at: null,
      }

      const orderItemsToSave: Omit<OrderItem, "id" | "order_id">[] = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
      }))

      const { data: addedOrder, error } = await dbOperations.addOrder(newOrder, orderItemsToSave)

      if (error) {
        console.error("Error processing payment:", error)
        toast({
          title: "Payment Failed",
          description: `Error: ${error.message}`,
          variant: "destructive",
        })
      } else {
        setOrders((prev) => [addedOrder!, ...prev]) // Add new order to the top
        toast({
          title: "Payment Successful!",
          description: `Order ${addedOrder?.id.substring(0, 8)}... completed. Change due: ${formatCurrency(changeDue, settings.currencySymbol, settings.decimalPlaces)}.`,
        })
        printReceipt({
          ...addedOrder!,
          order_items: cart,
          ...settings,
          subtotal,
          taxAmount,
          totalDiscount: totalDiscountAmount,
          totalFees: totalFeesAmount,
        })
        handleClearCart()
      }
    },
    [
      cart,
      selectedCustomer,
      total,
      totalDiscountAmount,
      totalFeesAmount,
      orderNotes,
      dbOperations,
      settings,
      handleClearCart,
    ],
  )

  const handleLoadOrder = useCallback(
    async (order: Order) => {
      const { data: items, error } = await dbOperations.getOrderItems(order.id)
      if (error) {
        console.error("Error loading order items:", error)
        toast({
          title: "Error",
          description: "Failed to load order items.",
          variant: "destructive",
        })
        return
      }

      const cartItems: CartItem[] = items
        ? items.map((item) => {
            const product = products.find((p) => p.id === item.product_id)
            return {
              ...product!, // Assuming product will always be found
              quantity: item.quantity,
              discount: item.discount,
            }
          })
        : []

      setCart(cartItems)
      setSelectedCustomer(customers.find((c) => c.id === order.customer_id) || null)
      setOrderNotes(order.notes || "")
      // Reconstruct fees and total discount if stored in order notes or a separate field
      // For now, assuming they are not directly stored in order object for simplicity
      setOrderFees([])
      setTotalOrderDiscountPercentage(0)
      setShippingDetails(
        order.shipping_address
          ? {
              address: order.shipping_address,
              cost: order.shipping_cost,
              provider: deliveryProviders.find((dp) => dp.id === order.delivery_provider_id),
            }
          : null,
      )

      toast({
        title: "Order Loaded",
        description: `Order ${order.id.substring(0, 8)}... loaded into cart.`,
      })
    },
    [dbOperations, products, customers, deliveryProviders],
  )

  // Function to initiate void order confirmation
  const initiateVoidOrder = useCallback((orderId: string) => {
    setOrderToVoid(orderId)
    setShowVoidConfirmationModal(true)
  }, [])

  // Function to confirm and execute void order
  const confirmVoidOrder = useCallback(async () => {
    if (!orderToVoid) return

    const { data, error } = await dbOperations.updateOrderStatus(orderToVoid, "voided", "voided_at")
    if (error) {
      console.error("Error voiding order:", error)
      toast({
        title: "Error",
        description: `Failed to void order: ${error.message}`,
        variant: "destructive",
      })
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderToVoid ? { ...o, status: "voided", voided_at: data?.voided_at || null } : o)),
      )
      toast({
        title: "Order Voided",
        description: `Order ${orderToVoid.substring(0, 8)}... has been voided.`,
        variant: "destructive", // Red notification for voided orders
      })
    }
    setShowVoidConfirmationModal(false) // Close the confirmation modal
    setOrderToVoid(null) // Clear the order to void
  }, [dbOperations, orderToVoid])

  const handleRefundOrder = useCallback(
    (orderId: string) => {
      const order = orders.find((o) => o.id === orderId)
      if (order) {
        setOrderToRefund(order)
        setIsRefundModalOpen(true)
      }
    },
    [orders],
  )

  const handleProcessRefund = useCallback(
    async (orderId: string, refundAmount: number, reason: string) => {
      const { data, error } = await dbOperations.refundOrder(orderId, refundAmount, reason)
      if (error) {
        console.error("Error processing refund:", error)
        toast({
          title: "Error",
          description: `Failed to process refund: ${error.message}`,
          variant: "destructive",
        })
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: "refunded",
                  payment_status: "refunded", // Or 'partially_refunded'
                  refunded_at: data?.refunded_at || null,
                  refund_reason: data?.refund_reason || null,
                  amount_paid: data?.amount_paid || o.amount_paid, // Update amount_paid after partial refund
                }
              : o,
          ),
        )
        toast({
          title: "Refund Processed",
          description: `Refund of ${formatCurrency(refundAmount, settings.currencySymbol, settings.decimalPlaces)} processed for order ${orderId.substring(0, 8)}...`,
        })
      }
    },
    [dbOperations, settings.currencySymbol, settings.decimalPlaces],
  )

  const handleZReport = useCallback(
    (data: { startAmount: number; endAmount: number; cashIn: number; cashOut: number }) => {
      // In a real app, this would save the Z-report data to the database
      console.log("Z-Report Data:", data)
      setCurrentCashInDrawer(data.endAmount) // Update cash in drawer to end amount
      toast({
        title: "Z-Report Generated",
        description: "Z-Report data logged to console and cash drawer updated.",
      })
    },
    [],
  )

  const handleCashIn = useCallback(
    (amount: number) => {
      setCurrentCashInDrawer((prev) => prev + amount)
      toast({
        title: "Cash In",
        description: `${formatCurrency(amount, settings.currencySymbol, settings.decimalPlaces)} added to drawer.`,
      })
    },
    [settings.currencySymbol, settings.decimalPlaces],
  )

  const handleCashOut = useCallback(
    (amount: number) => {
      setCurrentCashInDrawer((prev) => prev - amount)
      toast({
        title: "Cash Out",
        description: `${formatCurrency(amount, settings.currencySymbol, settings.decimalPlaces)} removed from drawer.`,
      })
    },
    [settings.currencySymbol, settings.decimalPlaces],
  )

  const handleScanResult = useCallback(
    (scannedData: string) => {
      const product = products.find((p) => p.sku === scannedData)
      if (product) {
        handleAddToCart(product)
        toast({
          title: "Product Added",
          description: `${product.name} added to cart from QR scan.`,
        })
      } else {
        toast({
          title: "Product Not Found",
          description: `No product found with SKU: ${scannedData}`,
          variant: "destructive",
        })
      }
    },
    [products, handleAddToCart],
  )

  const handleViewQrCode = useCallback((product: Product) => {
    setProductForQrCode(product)
    setIsQrCodeModalOpen(true)
  }, [])

  // Placeholder for OpenSooq publishing logic
  const handlePublishOpenSooq = async (product: Product) => {
    if (!settings.openSooqPhoneNumber || !settings.openSooqPassword) {
      toast({
        title: "OpenSooq Configuration Missing",
        description:
          "OpenSooq login details (phone number or password) are missing in settings. Please configure them.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "OpenSooq Publishing",
      description: `Attempting to publish '${product.name}' to OpenSooq... (Simulated)`,
    })
    console.log(`[OpenSooq Publisher] Starting publish process for product: ${product.name}`)
    console.log(
      `[OpenSooq Publisher] Using phone: ${settings.openSooqPhoneNumber}, password: ${settings.openSooqPassword.replace(/./g, "*")}`,
    )
    console.log(`[OpenSooq Publisher] Auto repost timer set to: ${settings.openSooqRepostTimer} hours`)

    try {
      // Simulate various steps of publishing
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay
      console.log("[OpenSooq Publisher] Simulated navigation and login.")
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate login time
      console.log("[OpenSooq Publisher] Simulated product details entry.")
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate image upload and form submission

      toast({
        title: "OpenSooq Publishing Successful",
        description: `Product '${product.name}' successfully published to OpenSooq (simulated)!`,
      })
    } catch (error) {
      console.error("[OpenSooq Publisher] An error occurred during simulated publishing:", error)
      toast({
        title: "OpenSooq Publishing Failed",
        description: "An error occurred during OpenSooq publishing (simulated). Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading POS System...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Hidden audio element for notifications */}
      <audio ref={audioRef} src="https://www.soundjay.com/buttons/sounds/button-1.mp3" preload="auto" />
      <audio
        src="/sounds/delete-sound.mp3" // You'll need to provide this sound file
        preload="auto"
        id="delete-sound"
      />

      {/* Header */}
      <header className="w-full bg-white border-b border-border px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800">CosyPOS</h1>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="What are you looking for?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full border border-input focus:ring-ring focus:border-ring"
            />
          </div>
        </div>
        <nav className="flex items-center space-x-4">
          <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">
            Front Register
          </Button>
          <Button
            variant="ghost"
            className="text-gray-700 hover:bg-gray-100 flex items-center gap-1"
            onClick={() => setIsLoadModalOpen(true)}
          >
            <Cloud className="w-4 h-4" />
            Load
          </Button>
          <Button
            variant="ghost"
            className="text-gray-700 hover:bg-gray-100 flex items-center gap-1"
            onClick={() => setIsOrdersModalOpen(true)}
          >
            <ClipboardList className="w-4 h-4" />
            Orders
          </Button>
          <Button
            variant="ghost"
            className="text-gray-700 hover:bg-gray-100 flex items-center gap-1"
            onClick={() => setIsCashManagementModalOpen(true)}
          >
            <Wallet className="w-4 h-4" />
            Cash Management
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white text-foreground border-border shadow-lg">
              <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">
                <Link href="/settings" className="flex items-center w-full text-gray-700">
                  <Settings className="w-4 h-4 mr-2" /> App Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer flex items-center gap-1">
                <Wifi className={`w-4 h-4 ${dbOperations.isOnline ? "text-green-500" : "text-red-500"}`} />
                {dbOperations.isOnline ? "Online" : "Offline"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-100 cursor-pointer relative"
                onClick={() => {
                  /* Logic to open notifications */
                }}
              >
                <Bell className="w-4 h-4 mr-2" /> Notifications
                {/* Add notification badge if needed */}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>EH</AvatarFallback>
          </Avatar>
        </nav>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Product List */}
        <div className="w-2/3 p-6 flex flex-col bg-white border-r border-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Products</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsProductModalOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" /> Manage Products
              </Button>
              <Button
                onClick={() => setIsQrScannerModalOpen(true)}
                variant="outline"
                className="border-input bg-background hover:bg-accent text-foreground"
              >
                <QrCode className="w-4 h-4 mr-2" /> Scan Product
              </Button>
            </div>
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className={
                selectedCategory === null
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-input bg-background hover:bg-accent text-foreground"
              }
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-input bg-background hover:bg-accent text-foreground"
                }
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-md transition-shadow border border-border bg-card text-card-foreground"
                onClick={() => handleAddToCart(product)}
              >
                <CardContent className="flex flex-col items-center justify-center p-4 h-36">
                  <span className="text-4xl mb-2">{product.image}</span>
                  <span className="text-sm font-medium text-center">{product.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(product.price, settings.currencySymbol, settings.decimalPlaces)}
                  </span>
                  {settings.openSooqEnabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full flex items-center justify-center gap-1 text-blue-600 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation() // Prevent adding to cart when clicking this button
                        handlePublishOpenSooq(product)
                      }}
                    >
                      <Share2 className="w-3 h-3" />
                      Publish OS
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Panel: Cart and Order Summary */}
        <div className="w-1/3 p-6 flex flex-col bg-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Cart</h2>
            <Button onClick={handleClearCart} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" /> Clear Cart
            </Button>
          </div>

          {/* Customer Section */}
          <div className="mb-4 p-3 bg-muted rounded-md border border-border">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-foreground">Customer</h3>
              <Button
                onClick={() => setIsCustomerModalOpen(true)}
                variant="outline"
                size="sm"
                className="border-input bg-background hover:bg-accent text-foreground"
              >
                <Users className="w-4 h-4 mr-1" /> {selectedCustomer ? "Change" : "Select"}
              </Button>
            </div>
            {selectedCustomer ? (
              <div className="text-muted-foreground">
                <p className="font-medium">{selectedCustomer.name}</p>
                <p className="text-sm">{selectedCustomer.phone}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No customer selected.</p>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto pr-2 mb-4 space-y-3">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground mt-10">Your cart is empty.</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-card p-3 rounded-md border border-border"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.image}</span>
                    <div>
                      <div className="font-medium text-foreground">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(item.price, settings.currencySymbol, settings.decimalPlaces)}
                        {item.discount && item.discount > 0 && (
                          <span className="text-destructive ml-2">
                            (-{formatCurrency(item.discount, settings.currencySymbol, settings.decimalPlaces)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      className="w-8 h-8 border-input bg-background hover:bg-accent text-foreground"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-medium text-foreground">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="w-8 h-8 border-input bg-background hover:bg-accent text-foreground"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-muted p-4 rounded-md border border-border space-y-2 mb-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal:</span>
              <span>
                {formatCurrency(subtotal + totalDiscountAmount, settings.currencySymbol, settings.decimalPlaces)}
              </span>
            </div>
            {totalDiscountAmount > 0 && (
              <div className="flex justify-between text-sm text-destructive">
                <span>Discount ({totalOrderDiscountPercentage}%):</span>
                <span>-{formatCurrency(totalDiscountAmount, settings.currencySymbol, settings.decimalPlaces)}</span>
              </div>
            )}
            {orderFees.length > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Fees:</span>
                <span>{formatCurrency(totalFeesAmount, settings.currencySymbol, settings.decimalPlaces)}</span>
              </div>
            )}
            {settings.taxRate > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Tax ({settings.taxRate * 100}%):</span>
                <span>{formatCurrency(taxAmount, settings.currencySymbol, settings.decimalPlaces)}</span>
              </div>
            )}
            {settings.shipping.enabled && shippingDetails && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping:</span>
                <span>{formatCurrency(shippingDetails.cost, settings.currencySymbol, settings.decimalPlaces)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xl text-foreground border-t border-border pt-2">
              <span>Total:</span>
              <span>
                {formatCurrency(total + (shippingDetails?.cost || 0), settings.currencySymbol, settings.decimalPlaces)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Button
              onClick={() => setIsDiscountModalOpen(true)}
              variant="outline"
              className="border-input bg-background hover:bg-accent text-foreground"
            >
              <Percent className="w-4 h-4 mr-2" /> Discount
            </Button>
            <Button
              onClick={() => setIsFeeModalOpen(true)}
              variant="outline"
              className="border-input bg-background hover:bg-accent text-foreground"
            >
              <Tag className="w-4 h-4 mr-2" /> Fees
            </Button>
            <Button
              onClick={() => setIsNoteModalOpen(true)}
              variant="outline"
              className="border-input bg-background hover:bg-accent text-foreground"
            >
              <FileText className="w-4 h-4 mr-2" /> Note
            </Button>
            {settings.shipping.enabled && (
              <Button
                onClick={() => setIsShippingModalOpen(true)}
                variant="outline"
                className="border-input bg-background hover:bg-accent text-foreground col-span-3"
              >
                <Truck className="w-4 h-4 mr-2" /> Shipping
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setIsLoadModalOpen(true)}
              variant="outline"
              className="border-input bg-background hover:bg-accent text-foreground"
            >
              <Receipt className="w-4 h-4 mr-2" /> Load Order
            </Button>
            <Button
              onClick={() => setIsOrdersModalOpen(true)}
              variant="outline"
              className="border-input bg-background hover:bg-accent text-foreground"
            >
              <ClipboardList className="w-4 h-4 mr-2" /> Orders
            </Button>
            <Button
              onClick={() => setIsCashManagementModalOpen(true)}
              variant="outline"
              className="border-input bg-background hover:bg-accent text-foreground col-span-2"
            >
              <Wallet className="w-4 h-4 mr-2" /> Cash Management
            </Button>
            <Button
              onClick={() => setIsPaymentModalOpen(true)}
              className="col-span-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg"
              disabled={cart.length === 0}
            >
              <DollarSign className="w-5 h-5 mr-2" /> Process Payment
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        products={products}
        onProductSaved={handleProductSaved}
        onDeleteProduct={handleDeleteProduct}
        categories={categories}
        onAddCategory={handleAddCategory}
        onViewQrCode={handleViewQrCode}
        settings={settings}
      />
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
        onCustomerSaved={handleCustomerSaved}
        onDeleteCustomer={handleDeleteCustomer}
      />
      <DiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        cartItems={cart}
        onApplyItemDiscount={handleApplyItemDiscount}
        onApplyTotalDiscount={handleApplyTotalDiscount}
        totalDiscountPercentage={totalOrderDiscountPercentage}
      />
      <FeeModal
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        currentFees={orderFees}
        onSaveFees={handleSaveFees}
        settings={settings}
      />
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        currentNote={orderNotes}
        onSaveNote={handleSaveNotes}
      />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={total}
        onProcessPayment={handleProcessPayment}
        shippingEnabled={settings.shipping.enabled}
        shippingDetails={shippingDetails}
        deliveryProviders={deliveryProviders}
        customer={selectedCustomer}
      />
      <LoadModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        orders={orders}
        onLoadOrder={handleLoadOrder}
        onDeleteOrder={dbOperations.deleteOrder}
        settings={settings}
      />
      <RefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        order={orderToRefund}
        onRefundOrder={handleProcessRefund}
        settings={settings}
      />
      <CashManagementModal
        isOpen={isCashManagementModalOpen}
        onClose={() => setIsCashManagementModalOpen(false)}
        onZReport={handleZReport}
        onCashIn={handleCashIn}
        onCashOut={handleCashOut}
        currentCashInDrawer={currentCashInDrawer}
        settings={settings}
      />
      <QrScannerModal
        isOpen={isQrScannerModalOpen}
        onClose={() => setIsQrScannerModalOpen(false)}
        onScan={handleScanResult}
      />
      <QrCodeModal
        isOpen={isQrCodeModalOpen}
        onClose={() => setIsQrCodeModalOpen(false)}
        product={productForQrCode}
        settings={settings}
      />
      <ShippingModal
        isOpen={isShippingModalOpen}
        onClose={() => setIsShippingModalOpen(false)}
        currentShippingDetails={shippingDetails}
        deliveryProviders={deliveryProviders}
        onSaveShipping={handleSaveShipping}
        settings={settings}
      />
      <OrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        orders={orders}
        onVoidOrder={initiateVoidOrder} // Use the new initiateVoidOrder
        onRefundOrder={handleRefundOrder}
        settings={settings}
      />

      {/* Void Confirmation Modal */}
      <Dialog open={showVoidConfirmationModal} onOpenChange={setShowVoidConfirmationModal}>
        <DialogContent className="sm:max-w-[425px] bg-white text-foreground">
          <DialogHeader>
            <DialogTitle>Confirm Void Order</DialogTitle>
            <DialogDescription>Are you sure you want to void the current order?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVoidConfirmationModal(false)}>
              No
            </Button>
            <Button variant="destructive" onClick={confirmVoidOrder}>
              Yes, Void
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
