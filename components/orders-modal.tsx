"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Undo2, DollarSign, Printer } from "lucide-react"
import type { Order } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import type { useSettings } from "@/lib/settings-context"
import { printReceipt } from "@/lib/receipt-printer"
import { toast } from "@/hooks/use-toast"

interface OrdersModalProps {
  isOpen: boolean
  onClose: () => void
  orders: Order[]
  onVoidOrder: (orderId: string) => void
  onRefundOrder: (orderId: string) => void
  settings: ReturnType<typeof useSettings>["settings"] // Use the settings type from context
}

export function OrdersModal({ isOpen, onClose, orders, onVoidOrder, onRefundOrder, settings }: OrdersModalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("")
    }
  }, [isOpen])

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [orders, searchTerm])

  const handlePrintReceipt = (order: Order) => {
    // For printing, we need the full order details including items.
    // In a real app, you'd fetch order items here or pass them from parent.
    // For now, we'll simulate with basic info.
    // NOTE: This mock printReceipt will not have full item details unless passed.
    // The main app/page.tsx passes cart items to printReceipt, but here we only have Order object.
    // A more robust solution would fetch order items here or pass a more complete order object.
    printReceipt(
      {
        ...order,
        order_items: [], // Placeholder, ideally fetch actual items
        subtotal: order.total_amount, // Simplified for mock
        taxAmount: 0, // Simplified for mock
        totalDiscount: order.total_discount,
        totalFees: order.total_fees,
      },
      settings,
    )
    toast({
      title: "Receipt Printed",
      description: `Receipt for order ${order.id.substring(0, 8)}... sent to printer (console).`,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Order History</DialogTitle>
          <DialogDescription>View past orders, void, or process refunds.</DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search orders by ID, customer, payment method, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No orders found.</p>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-md border bg-card shadow-sm"
                >
                  <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div className="font-medium text-foreground col-span-2">
                      Order ID: <span className="text-muted-foreground">{order.id.substring(0, 8)}...</span>
                    </div>
                    <div className="text-muted-foreground">
                      Customer: <span className="font-medium text-foreground">{order.customer_name || "N/A"}</span>
                    </div>
                    <div className="text-muted-foreground">
                      Total:{" "}
                      <span className="font-medium text-foreground">
                        {formatCurrency(order.total_amount, settings.currencySymbol, settings.decimalPlaces)}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      Payment: <span className="font-medium text-foreground capitalize">{order.payment_method}</span>
                    </div>
                    <div className="text-muted-foreground">
                      Status:{" "}
                      <span
                        className={`font-medium capitalize ${
                          order.status === "voided"
                            ? "text-destructive"
                            : order.status === "refunded"
                              ? "text-orange-500"
                              : "text-green-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="text-muted-foreground col-span-2">
                      Date:{" "}
                      <span className="font-medium text-foreground">{new Date(order.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => handlePrintReceipt(order)}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Printer className="w-4 h-4" /> Print
                    </Button>
                    <Button
                      onClick={() => onRefundOrder(order.id)}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      disabled={order.status === "refunded" || order.status === "voided"}
                    >
                      <DollarSign className="w-4 h-4" /> Refund
                    </Button>
                    <Button
                      onClick={() => onVoidOrder(order.id)}
                      size="sm"
                      variant="destructive"
                      className="flex items-center gap-1"
                      disabled={order.status === "voided" || order.status === "refunded"}
                    >
                      <Undo2 className="w-4 h-4" /> Void
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
