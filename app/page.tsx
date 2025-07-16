"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Minus, Trash2, DollarSign, User, Tag, ClipboardList, ScanLine, Percent, Wallet, X } from "lucide-react"
import { formatCurrency, calculateTotal } from "@/lib/utils"
import { ProductModal } from "@/components/product-modal"
import { CustomerModal } from "@/components/customer-modal"
import { DiscountModal } from "@/components/discount-modal"
import { FeeModal } from "@/components/fee-modal"
import { PaymentModal } from "@/components/payment-modal"
import { OrdersModal } from "@/components/orders-modal"
import { RefundModal } from "@/components/refund-modal"
import { CashManagementModal } from "@/components/cash-management-modal"
import { QrScannerModal } from "@/components/qr-scanner-modal"
import { useSupabase } from "@/lib/supabase-context"
import { useSettings } from "@/lib/settings-context"
import { toast } from "@/hooks/use-toast"
import { printReceipt, printInvoice } from "@/lib/receipt-printer"
import type { Product, Customer, Order, OrderItem, Category, DeliveryProvider } from "@/lib/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CartItem extends Product {
  quantity: number
  discount?: number
}

export default function POSPage() {
  const { dbOperations } = useSupabase()
  const { settings, updateSettings } = useSettings()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [deliveryProviders, setDeliveryProviders] = useState<DeliveryProvider[]>([])

  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [totalOrderDiscountPercentage, setTotalOrderDiscountPercentage] = useState(0)
  const [additionalFees, setAdditionalFees] = useState<{ description: string; amount: number }[]>([])
  const [currentCashInDrawer, setCurrentCashInDrawer] = useState(0)

  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false)
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [refundOrder, setRefundOrder] = useState<Order | null>(null)
  const [isCashManagementModalOpen, setIsCashManagementModalOpen] = useState(false)
  const [isQrScannerModalOpen, setIsQrScannerModalOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>("All Categories")

  const refreshData = useCallback(async () => {
    const { data: productsData, error: productsError } = await dbOperations.getProducts()
    if (!productsError) setProducts(productsData || [])

    const { data: categoriesData, error: categoriesError } = await dbOperations.getCategories()
    if (!categoriesError) setCategories(categoriesData || [])

    const { data: customersData, error: customersError } = await dbOperations.getCustomers()
    if (!customersError) setCustomers(customersData || [])

    const ordersResponse = await fetch("/api/orders/fetch?storeId=dummy_store_id") // Pass a dummy storeId for now
    const ordersResult = await ordersResponse.json()
    if (ordersResponse.ok) {
      setOrders(ordersResult.orders || [])
    } else {
      console.error("Error fetching orders:", ordersResult.error)
      toast({ title: "Error", description: `Failed to load orders: ${ordersResult.error}`, variant: "destructive" })
    }

    const { data: providersData, error: providersError } = await dbOperations.getDeliveryProviders()
    if (!providersError) setDeliveryProviders(providersData || [])
  }, [dbOperations])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }
    return filtered
  }, [products, searchTerm, selectedCategory])

  const { subtotal, totalDiscountAmount, totalFeesAmount, taxAmount, total } = useMemo(() => {
    return calculateTotal(cart, settings.taxRate, additionalFees, totalOrderDiscountPercentage)
  }, [cart, settings.taxRate, additionalFees, totalOrderDiscountPercentage])

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setCart((prevCart) => {
      if (newQuantity <= 0) {
        return prevCart.filter((item) => item.id !== productId)
      }
      return prevCart.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item))
    })
  }

  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  const handleClearCart = () => {
    setCart([])
    setSelectedCustomer(null)
    setTotalOrderDiscountPercentage(0)
    setAdditionalFees([])
  }

  const handleProductSaved = async (product: Product) => {
    if (product.id) {
      await dbOperations.updateProduct(product.id, product)
      toast({ title: "Product Updated", description: `${product.name} has been updated.` })
    } else {
      await dbOperations.addProduct(product)
      toast({ title: "Product Added", description: `${product.name} has been added.` })
    }
    refreshData()
    setIsProductModalOpen(false)
    setEditingProduct(null)
  }

  const handleDeleteProduct = async (productId: string) => {
    await dbOperations.deleteProduct(productId)
    toast({ title: "Product Deleted", description: "Product has been removed." })
    refreshData()
    setIsProductModalOpen(false)
    setEditingProduct(null)
  }

  const handleAddCategory = async (categoryName: string) => {
    const { data, error } = await dbOperations.addCategory(categoryName)
    if (error) {
      toast({ title: "Error", description: `Failed to add category: ${error.message}`, variant: "destructive" })
    } else {
      toast({ title: "Category Added", description: `${categoryName} has been added.` })
      refreshData()
    }
  }

  const handleCustomerSelected = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsCustomerModalOpen(false)
    toast({ title: "Customer Selected", description: `${customer.name} has been added to the order.` })
  }

  const handleProcessPayment = async (
    paymentMethod: string,
    amountPaid: number,
    changeDue: number,
    shippingDetails?: { address: string; cost: number; provider?: DeliveryProvider; city?: string },
  ) => {
    if (cart.length === 0) {
      toast({ title: "Error", description: "Cart is empty.", variant: "destructive" })
      return
    }

    const orderItemsForDb: Omit<OrderItem, "id" | "order_id">[] = cart.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount || 0,
      name: item.name, // Ensure name is included for denormalization
    }))

    const itemsSummary = cart.map((item) => ({
      product_id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount || 0,
    }))

    const customerName = selectedCustomer?.name || "Guest"
    const customerId = selectedCustomer?.id || null

    const newOrderData = {
      customer_id: customerId,
      customer_name: customerName,
      total: total || 0,
      total_amount: total || 0,
      subtotal: subtotal || 0,
      tax_amount: taxAmount || 0,
      total_discount: totalDiscountAmount || 0,
      total_fees: totalFeesAmount || 0,
      payment_method: paymentMethod || "cash",
      amount_paid: amountPaid || 0,
      change_due: changeDue || 0,
      status: "pending",
      shipping_address: shippingDetails?.address || null,
      shipping_cost: shippingDetails?.cost || 0,
      delivery_provider_id: shippingDetails?.provider?.id || null,
      delivery_provider_name: shippingDetails?.provider?.name || null,
      shipping_city: shippingDetails?.city || null,
      order_type: shippingDetails ? "delivery" : "retail",
      payment_status: settings.paymentMethods?.find((pm) => pm.id === paymentMethod)?.isPaid ? "paid" : "unpaid",
      voided_at: null,
      refunded_at: null,
      refund_reason: null,
      cash_drawer_start_amount: currentCashInDrawer || 0,
      cash_drawer_end_amount: (currentCashInDrawer || 0) + (amountPaid || 0) - (changeDue || 0),
      cash_in_amount: (amountPaid || 0) - (changeDue || 0),
      cash_out_amount: 0,
      z_report_printed_at: null,
      notes: null,
      items: itemsSummary,
      store_id: "00000000-0000-0000-0000-000000000001", // Dummy store ID for now
    } as Omit<Order, "id" | "created_at" | "order_items"> & { items: unknown[] }

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: newOrderData,
        items: orderItemsForDb,
      }),
    })

    const resJson = await response.json()
    if (!response.ok) {
      toast({
        title: "Payment Failed",
        description: `Error: ${resJson.error}`,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Payment Successful",
      description: `Order ${resJson.orderId.substring(0, 8)}… created as PENDING.`,
    })
    setCurrentCashInDrawer((prev) => (prev || 0) + (amountPaid || 0) - (changeDue || 0))

    const printableOrder = {
      ...newOrderData,
      id: resJson.orderId,
      created_at: new Date().toISOString(),
      order_items: cart.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        discount: item.discount || 0,
        id: crypto.randomUUID(), // Dummy ID for printable order item
        order_id: resJson.orderId, // Link to the new order ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
    } as Order // Cast to Order type for print functions

    if (settings.receiptPrinterEnabled) {
      await printReceipt(printableOrder, settings)
    }
    handleClearCart()
    refreshData()
  }

  const handleVoidOrder = async (orderId: string) => {
    const { error } = await dbOperations.updateOrderStatus(orderId, "voided")
    if (error) {
      toast({ title: "Error", description: `Failed to void order: ${error.message}`, variant: "destructive" })
    } else {
      toast({ title: "Order Voided", description: `Order ${orderId.substring(0, 8)}... has been voided.` })
      refreshData()
    }
  }

  const handleRefundOrder = async (
    orderId: string,
    refundAmount: number,
    refundedItems: { itemId: string; quantity: number }[],
  ) => {
    const { error } = await dbOperations.updateOrderStatus(orderId, "refunded")
    if (error) {
      toast({ title: "Error", description: `Failed to refund order: ${error.message}`, variant: "destructive" })
    } else {
      toast({
        title: "Order Refunded",
        description: `Order ${orderId.substring(0, 8)}... has been refunded for ${formatCurrency(refundAmount, settings.currencySymbol, settings.decimalPlaces)}.`,
      })
      refreshData()
    }
  }

  const handleBatchUpdateOrderStatus = async (orderIds: string[], status: Order["status"]) => {
    const response = await fetch("/api/orders/batch-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderIds, status }),
    })

    const resJson = await response.json()
    if (!response.ok) {
      toast({
        title: "Status Update Failed",
        description: `Error: ${resJson.error}`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Status Updated",
        description: `${resJson.updatedCount} orders marked as ${status}.`,
      })
      refreshData()
    }
  }

  const handleGenerateInvoice = async (order: Order) => {
    if (!order.order_items || order.order_items.length === 0) {
      toast({
        title: "Invoice Error",
        description: "Order items not found for invoice generation.",
        variant: "destructive",
      })
      return
    }
    await printInvoice(order, settings)
    toast({
      title: "Invoice Generated",
      description: `Invoice for Order ${order.id.substring(0, 8)}... has been generated.`,
    })
  }

  const handleZReport = (data: { startAmount: number; endAmount: number; cashIn: number; cashOut: number }) => {
    toast({
      title: "Z-Report Generated",
      description: `Start: ${formatCurrency(data.startAmount, settings.currencySymbol, settings.decimalPlaces)}, End: ${formatCurrency(data.endAmount, settings.currencySymbol, settings.decimalPlaces)}, Cash In: ${formatCurrency(data.cashIn, settings.currencySymbol, settings.decimalPlaces)}, Cash Out: ${formatCurrency(data.cashOut, settings.currencySymbol, settings.decimalPlaces)}`,
    })
    setCurrentCashInDrawer(data.endAmount)
  }

  const handleCashIn = (amount: number) => {
    setCurrentCashInDrawer((prev) => (prev || 0) + amount)
    toast({
      title: "Cash In",
      description: `${formatCurrency(amount, settings.currencySymbol, settings.decimalPlaces)} added to drawer.`,
    })
  }

  const handleCashOut = (amount: number) => {
    setCurrentCashInDrawer((prev) => (prev || 0) - amount)
    toast({
      title: "Cash Out",
      description: `${formatCurrency(amount, settings.currencySymbol, settings.decimalPlaces)} removed from drawer.`,
    })
  }

  const handleScanResult = (sku: string) => {
    const product = products.find((p) => p.sku === sku)
    if (product) {
      handleAddToCart(product)
      toast({ title: "Product Scanned", description: `${product.name} added to cart.` })
    } else {
      toast({ title: "Product Not Found", description: `No product with SKU: ${sku}`, variant: "destructive" })
    }
    setIsQrScannerModalOpen(false)
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      <div className="flex-1 flex flex-col p-4 space-y-4">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Products</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingProduct(null)
                  setIsProductModalOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsQrScannerModalOpen(true)}>
                <ScanLine className="h-4 w-4 mr-2" /> Scan QR
              </Button>
            </div>
          </CardHeader>
          <div className="p-4 pt-0">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
            <Select value={selectedCategory || "All Categories"} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] mb-2">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Categories">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleAddToCart(product)}
                  >
                    <CardContent className="p-3 flex flex-col items-center text-center">
                      {/* Use placeholder.svg to avoid CORS issues with external blob URLs */}
                      <img
                        src={product.image && !product.image.startsWith("http") ? product.image : "/placeholder.svg"}
                        alt={product.name}
                        className="w-24 h-24 object-cover mb-2 rounded-md"
                      />
                      <p className="font-medium text-sm truncate w-full">{product.name}</p>
                      <p className="text-muted-foreground text-xs">{product.sku}</p>
                      <p className="font-bold text-lg">
                        {formatCurrency(product.price, settings.currencySymbol, settings.decimalPlaces)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingProduct(product)
                          setIsProductModalOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="w-96 flex flex-col p-4 space-y-4 border-l bg-white dark:bg-gray-900">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Cart</CardTitle>
            <Button variant="outline" size="sm" onClick={handleClearCart} disabled={cart.length === 0}>
              <Trash2 className="h-4 w-4 mr-2" /> Clear Cart
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Cart is empty.</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border p-3 rounded-md">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price, settings.currencySymbol, settings.decimalPlaces)} x{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value))}
                          className="w-16 text-center"
                          min={1}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Customer:</span>
              <Button variant="outline" size="sm" onClick={() => setIsCustomerModalOpen(true)}>
                <User className="h-4 w-4 mr-2" /> {selectedCustomer ? selectedCustomer.name : "Guest"}
              </Button>
            </div>
            {selectedCustomer && selectedCustomer.name !== "Guest" && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Email: {selectedCustomer.email}</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>
                  <X className="h-4 w-4" /> Remove
                </Button>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal, settings.currencySymbol, settings.decimalPlaces)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>
                  -{formatCurrency(totalDiscountAmount, settings.currencySymbol, settings.decimalPlaces)} (
                  {totalOrderDiscountPercentage}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Fees:</span>
                <span>+{formatCurrency(totalFeesAmount, settings.currencySymbol, settings.decimalPlaces)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({settings.taxRate * 100}%):</span>
                <span>+{formatCurrency(taxAmount, settings.currencySymbol, settings.decimalPlaces)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total:</span>
                <span>{formatCurrency(total, settings.currencySymbol, settings.decimalPlaces)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => setIsDiscountModalOpen(true)}>
            <Percent className="h-4 w-4 mr-2" /> Discount
          </Button>
          <Button variant="outline" onClick={() => setIsFeeModalOpen(true)}>
            <Tag className="h-4 w-4 mr-2" /> Fees
          </Button>
          <Button variant="outline" onClick={() => setIsOrdersModalOpen(true)}>
            <ClipboardList className="h-4 w-4 mr-2" /> Orders
          </Button>
          <Button variant="outline" onClick={() => setIsCashManagementModalOpen(true)}>
            <Wallet className="h-4 w-4 mr-2" /> Cash Mgmt
          </Button>
        </div>
        <Button
          size="lg"
          className="w-full py-6 text-lg"
          onClick={() => setIsPaymentModalOpen(true)}
          disabled={cart.length === 0}
        >
          <DollarSign className="h-6 w-6 mr-2" /> Process Payment
        </Button>
      </div>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false)
          setEditingProduct(null)
        }}
        onProductSaved={handleProductSaved}
        onDeleteProduct={handleDeleteProduct}
        product={editingProduct}
        categories={categories}
        onAddCategory={handleAddCategory}
      />
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onCustomerSelected={handleCustomerSelected}
        customers={customers}
        onCustomerSaved={async (customer) => {
          if (customer.id) {
            await dbOperations.updateCustomer(customer.id, customer)
            toast({ title: "Customer Updated", description: `${customer.name} has been updated.` })
          } else {
            await dbOperations.addCustomer(customer)
            toast({ title: "Customer Added", description: `${customer.name} has been added.` })
          }
          refreshData()
          setIsCustomerModalOpen(false)
        }}
      />
      <DiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        currentDiscountPercentage={totalOrderDiscountPercentage}
        onApplyDiscount={setTotalOrderDiscountPercentage}
        totalAmount={total}
      />
      <FeeModal
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        currentFees={additionalFees}
        onApplyFees={setAdditionalFees}
      />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={total}
        onProcessPayment={handleProcessPayment}
        shippingEnabled={settings.shipping.enabled}
        shippingDetails={null}
        deliveryProviders={deliveryProviders}
        customer={selectedCustomer}
      />
      <OrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        orders={orders}
        onVoidOrder={handleVoidOrder}
        onRefundOrder={(orderId) => {
          const orderToRefund = orders.find((o) => o.id === orderId)
          if (orderToRefund) {
            setRefundOrder(orderToRefund)
            setIsRefundModalOpen(true)
          } else {
            toast({ title: "Error", description: "Order not found for refund.", variant: "destructive" })
          }
        }}
        onBatchUpdateStatus={handleBatchUpdateOrderStatus}
        onGenerateInvoice={handleGenerateInvoice}
      />
      {refundOrder && (
        <RefundModal
          isOpen={isRefundModalOpen}
          onClose={() => {
            setIsRefundModalOpen(false)
            setRefundOrder(null)
          }}
          orderId={refundOrder.id}
          orderItems={refundOrder.order_items || []}
          onProcessRefund={handleRefundOrder}
        />
      )}
      <CashManagementModal
        isOpen={isCashManagementModalOpen}
        onClose={() => setIsCashManagementModalOpen(false)}
        onZReport={handleZReport}
        onCashIn={handleCashIn}
        onCashOut={handleCashOut}
        currentCashInDrawer={currentCashInDrawer}
      />
      <QrScannerModal
        isOpen={isQrScannerModalOpen}
        onClose={() => setIsQrScannerModalOpen(false)}
        onScanResult={handleScanResult}
      />
    </div>
  )
}
