"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { useSettings } from "@/lib/settings-context"
import type { Order } from "@/lib/supabase"

interface LoadModalProps {
  isOpen: boolean
  onClose: () => void
  orders: Order[]
  onLoadOrder: (order: Order) => void
}

export function LoadModal({ isOpen, onClose, orders, onLoadOrder }: LoadModalProps) {
  const { settings } = useSettings()
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
        order.status.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [orders, searchTerm])

  const handleLoad = (order: Order) => {
    onLoadOrder(order)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Load Order</DialogTitle>
          <DialogDescription>Select an order to load into the cart.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 flex-1 overflow-hidden">
          <Input
            placeholder="Search orders by ID, customer, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="flex-1 pr-4">
            {filteredOrders.length === 0 ? (
              <p className="text-center text-muted-foreground">No orders found.</p>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Order ID: {order.id.substring(0, 8)}...</p>
                        <p className="text-sm text-muted-foreground">Customer: {order.customer_name || "Guest"}</p>
                        <p className="text-sm text-muted-foreground">Status: {order.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatCurrency(
                            order.total_amount || order.total,
                            settings.currencySymbol,
                            settings.decimalPlaces,
                          )}
                        </p>
                        <Button size="sm" onClick={() => handleLoad(order)}>
                          Load
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <h4 className="font-semibold">Items:</h4>
                      <ul className="list-disc list-inside">
                        {order.order_items?.map((item, index) => (
                          <li key={index}>
                            {item.quantity}x {item.name} (
                            {formatCurrency(item.price, settings.currencySymbol, settings.decimalPlaces)} each)
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
