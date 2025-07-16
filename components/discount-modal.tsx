"use client"

import { useState, useEffect } from "react"
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
import { formatCurrency } from "@/lib/utils"
import { useSettings } from "@/lib/settings-context"
import { toast } from "@/hooks/use-toast"

interface DiscountModalProps {
  isOpen: boolean
  onClose: () => void
  currentDiscountPercentage: number
  onApplyDiscount: (percentage: number) => void
  totalAmount: number
}

export function DiscountModal({
  isOpen,
  onClose,
  currentDiscountPercentage,
  onApplyDiscount,
  totalAmount,
}: DiscountModalProps) {
  const { settings } = useSettings()
  const [discountPercentage, setDiscountPercentage] = useState(currentDiscountPercentage.toString())

  useEffect(() => {
    setDiscountPercentage(currentDiscountPercentage.toString())
  }, [currentDiscountPercentage, isOpen])

  const handleApply = () => {
    const percentage = Number.parseFloat(discountPercentage)
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast({
        title: "Invalid Discount",
        description: "Discount percentage must be between 0 and 100.",
        variant: "destructive",
      })
      return
    }
    onApplyDiscount(percentage)
    toast({
      title: "Discount Applied",
      description: `Order discount set to ${percentage}%.`,
    })
    onClose()
  }

  const discountedAmount = totalAmount * (Number.parseFloat(discountPercentage) / 100 || 0)
  const finalAmount = totalAmount - discountedAmount

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
          <DialogDescription>Apply a percentage-based discount to the entire order.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
            <Input
              id="discountPercentage"
              type="number"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              placeholder="0"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Original Total:</span>
            <span>{formatCurrency(totalAmount, settings.currencySymbol, settings.decimalPlaces)}</span>
          </div>
          <div className="flex justify-between items-center text-red-500">
            <span className="font-medium">Discount Amount:</span>
            <span>-{formatCurrency(discountedAmount, settings.currencySymbol, settings.decimalPlaces)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
            <span>Final Total:</span>
            <span>{formatCurrency(finalAmount, settings.currencySymbol, settings.decimalPlaces)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Discount</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
