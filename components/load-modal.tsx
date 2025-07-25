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
import { Search, Trash2, CheckCircle2 } from "lucide-react"
import type { Order } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import type { Settings } from "@/lib/settings-context"

interface LoadModalProps {
  isOpen: boolean
  onClose: () => void
  orders: Order[]
  onLoadOrder: (order: Order) => void
  onDeleteOrder: (orderId: string) => Promise<{ error?: Error | null }>
  settings: Settings
}

export function LoadModal({ isOpen, onClose, orders, onLoadOrder, onDeleteOrder, settings }: LoadModalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("")
    }
  }, [isOpen])

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status !== "voided" &&
        order.status !== "refunded" &&
        (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.payment_method.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [orders, searchTerm])

  const handleDelete = async (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      const { error } = await onDeleteOrder(orderId)
      if (error) {
        console.error("Error deleting order:", error)
        alert("Failed to delete order: " + error.message)
      } else {
        alert("Order deleted successfully.")
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Load Order</DialogTitle>
          <DialogDescription>
            Select an existing order to load it into the cart for modification or re-printing.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search orders by ID, customer name, or payment method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No active orders found.</p>
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
                      Status: <span className="font-medium text-foreground capitalize">{order.status}</span>
                    </div>
                    <div className="text-muted-foreground col-span-2">
                      Date:{" "}
                      <span className="font-medium text-foreground">{new Date(order.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button onClick={() => onLoadOrder(order)} size="sm" className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Load
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(order.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
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
