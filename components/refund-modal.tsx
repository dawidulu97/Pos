"use client"

import { useState, useEffect } from "react"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Order } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import type { Settings } from "@/lib/settings-context"

interface RefundModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
  onRefundOrder: (orderId: string, refundAmount: number, reason: string) => void
  settings: Settings // Add settings prop
}

export function RefundModal({ isOpen, onClose, order, onRefundOrder, settings }: RefundModalProps) {
  const [refundAmount, setRefundAmount] = useState(0)
  const [refundReason, setRefundReason] = useState("")

  useEffect(() => {
    if (isOpen && order) {
      setRefundAmount(order.total_amount) // Default to full refund
      setRefundReason("")
    }
  }, [isOpen, order])

  const handleRefund = () => {
    if (order && refundAmount > 0 && refundReason.trim() !== "") {
      onRefundOrder(order.id, refundAmount, refundReason)
      onClose()
    } else {
      // Optionally show a toast or alert for validation
      alert("Please enter a valid refund amount and reason.")
    }
  }

  const maxRefundableAmount = order?.total_amount || 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            Refund an order. Max refundable:{" "}
            {formatCurrency(maxRefundableAmount, settings.currencySymbol, settings.decimalPlaces)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="order-id">Order ID</Label>
            <Input id="order-id" value={order?.id || ""} readOnly className="font-mono" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="refund-amount">Refund Amount</Label>
            <Input
              id="refund-amount"
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(Number.parseFloat(e.target.value))}
              min={0}
              max={maxRefundableAmount}
              step={0.01}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="refund-reason">Reason for Refund</Label>
            <Textarea
              id="refund-reason"
              placeholder="e.g., Customer return, item damaged, etc."
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleRefund}
            disabled={refundAmount <= 0 || refundAmount > maxRefundableAmount || refundReason.trim() === ""}
          >
            Confirm Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
