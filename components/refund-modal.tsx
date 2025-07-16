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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency } from "@/lib/utils"
import { useSettings } from "@/lib/settings-context"
import { toast } from "@/hooks/use-toast"
import type { OrderItem } from "@/lib/supabase"

interface RefundModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  orderItems: OrderItem[]
  onProcessRefund: (
    orderId: string,
    refundAmount: number,
    refundedItems: { itemId: string; quantity: number }[],
  ) => void
}

export function RefundModal({ isOpen, onClose, orderId, orderItems, onProcessRefund }: RefundModalProps) {
  const { settings } = useSettings()
  const [refundItems, setRefundItems] = useState<{ [itemId: string]: number }>({})
  const [refundAmountManual, setRefundAmountManual] = useState("")
  const [isFullRefund, setIsFullRefund] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setRefundItems({})
      setRefundAmountManual("")
      setIsFullRefund(false)
    }
  }, [isOpen])

  const calculateRefundAmount = useMemo(() => {
    let calculatedAmount = 0
    if (isFullRefund) {
      calculatedAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity - (item.discount || 0), 0)
    } else {
      for (const itemId in refundItems) {
        const item = orderItems.find((i) => i.id === itemId)
        if (item) {
          calculatedAmount += (item.price - (item.discount || 0)) * refundItems[itemId]
        }
      }
    }
    return calculatedAmount
  }, [refundItems, orderItems, isFullRefund])

  const handleItemQuantityChange = (itemId: string, quantity: number) => {
    setRefundItems((prev) => ({ ...prev, [itemId]: quantity }))
    setIsFullRefund(false) // Uncheck full refund if individual items are selected
  }

  const handleFullRefundToggle = (checked: boolean) => {
    setIsFullRefund(checked)
    if (checked) {
      const allItems: { [itemId: string]: number } = {}
      orderItems.forEach((item) => {
        allItems[item.id] = item.quantity
      })
      setRefundItems(allItems)
      setRefundAmountManual("")
    } else {
      setRefundItems({})
    }
  }

  const handleProcess = () => {
    let finalRefundAmount = Number.parseFloat(refundAmountManual)
    let refundedItemsList: { itemId: string; quantity: number }[] = []

    if (isFullRefund) {
      finalRefundAmount = calculateRefundAmount
      refundedItemsList = orderItems.map((item) => ({ itemId: item.id, quantity: item.quantity }))
    } else if (refundAmountManual.trim() !== "") {
      if (isNaN(finalRefundAmount) || finalRefundAmount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a positive number for refund amount.",
          variant: "destructive",
        })
        return
      }
      // If manual amount is entered, we don't have specific item quantities for refund
      // This might need more sophisticated logic in a real app (e.g., prorating items)
      refundedItemsList = [] // Or a dummy entry indicating a manual refund
    } else if (Object.keys(refundItems).length > 0) {
      finalRefundAmount = calculateRefundAmount
      refundedItemsList = Object.entries(refundItems).map(([itemId, quantity]) => ({ itemId, quantity }))
    } else {
      toast({
        title: "No Refund Selected",
        description: "Please select items to refund or enter a manual amount.",
        variant: "destructive",
      })
      return
    }

    onProcessRefund(orderId, finalRefundAmount, refundedItemsList)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Refund Order #{orderId.substring(0, 8)}...</DialogTitle>
          <DialogDescription>Select items to refund or enter a custom refund amount.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 flex-1 overflow-hidden">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="fullRefund"
              checked={isFullRefund}
              onCheckedChange={(checked) => handleFullRefundToggle(checked as boolean)}
            />
            <Label htmlFor="fullRefund">Full Refund</Label>
          </div>

          {!isFullRefund && (
            <>
              <Label>Refund Specific Items:</Label>
              <ScrollArea className="h-40 border rounded-md p-3">
                {orderItems.length === 0 ? (
                  <p className="text-center text-muted-foreground">No items in this order.</p>
                ) : (
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span>
                          {item.name} (Max: {item.quantity})
                        </span>
                        <Input
                          type="number"
                          value={refundItems[item.id] || ""}
                          onChange={(e) =>
                            handleItemQuantityChange(
                              item.id,
                              Math.min(item.quantity, Math.max(0, Number.parseInt(e.target.value) || 0)),
                            )
                          }
                          className="w-20 text-center"
                          min="0"
                          max={item.quantity}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refundAmountManual">Manual Refund Amount</Label>
                <Input
                  id="refundAmountManual"
                  type="number"
                  value={refundAmountManual}
                  onChange={(e) => {
                    setRefundAmountManual(e.target.value)
                    setIsFullRefund(false) // Uncheck full refund if manual amount is entered
                    setRefundItems({}) // Clear item selection
                  }}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
              </div>
            </>
          )}

          <div className="flex justify-between items-center text-lg font-bold border-t pt-4 mt-4">
            <span>Calculated Refund:</span>
            <span>
              {formatCurrency(
                Number.parseFloat(refundAmountManual) || calculateRefundAmount,
                settings.currencySymbol,
                settings.decimalPlaces,
              )}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleProcess}>Process Refund</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
