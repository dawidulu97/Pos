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
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency } from "@/lib/utils"
import { useSettings } from "@/lib/settings-context" // Import useSettings

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  discount?: number // Percentage discount
}

interface DiscountModalProps {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
  onApplyItemDiscount: (productId: string, discount: number) => void
  onApplyTotalDiscount: (discountPercentage: number) => void
  totalDiscountPercentage: number
}

export function DiscountModal({
  isOpen,
  onClose,
  cartItems = [], // Provide a default empty array
  onApplyItemDiscount,
  onApplyTotalDiscount,
  totalDiscountPercentage,
}: DiscountModalProps) {
  const { settings } = useSettings()
  const [itemDiscounts, setItemDiscounts] = useState<{ [key: string]: number }>({})
  const [totalDiscountInput, setTotalDiscountInput] = useState(totalDiscountPercentage)

  useEffect(() => {
    if (isOpen) {
      const initialItemDiscounts: { [key: string]: number } = {}
      cartItems.forEach((item) => {
        initialItemDiscounts[item.id] = item.discount || 0
      })
      setItemDiscounts(initialItemDiscounts)
      setTotalDiscountInput(totalDiscountPercentage)
    }
  }, [isOpen, cartItems, totalDiscountPercentage])

  const handleItemDiscountChange = (productId: string, value: string) => {
    const discount = Number.parseFloat(value)
    setItemDiscounts((prev) => ({
      ...prev,
      [productId]: isNaN(discount) ? 0 : Math.max(0, Math.min(100, discount)), // Ensure between 0-100
    }))
  }

  const handleApplyItemDiscountClick = (productId: string) => {
    onApplyItemDiscount(productId, itemDiscounts[productId] || 0)
  }

  const handleTotalDiscountChange = (value: string) => {
    const discount = Number.parseFloat(value)
    setTotalDiscountInput(isNaN(discount) ? 0 : Math.max(0, Math.min(100, discount))) // Ensure between 0-100
  }

  const handleApplyTotalDiscountClick = () => {
    onApplyTotalDiscount(totalDiscountInput)
    onClose()
  }

  const calculateItemDiscountAmount = (item: CartItem) => {
    const discountPercentage = itemDiscounts[item.id] || 0
    return (item.price * item.quantity * discountPercentage) / 100
  }

  const calculateItemPriceAfterDiscount = (item: CartItem) => {
    const discountPercentage = item.discount || 0
    return item.price * (1 - discountPercentage / 100)
  }

  const totalCartValue = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [cartItems])

  const totalItemDiscountsApplied = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + calculateItemDiscountAmount(item), 0)
  }, [cartItems, itemDiscounts])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
          <DialogDescription>Apply discounts per item or to the total order.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="total" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="total">Total Discount</TabsTrigger>
            <TabsTrigger value="items">Item Discounts</TabsTrigger>
          </TabsList>
          <TabsContent value="total" className="flex-1 flex flex-col p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="total-discount">Total Order Discount (%)</Label>
                <Input
                  id="total-discount"
                  type="number"
                  value={totalDiscountInput}
                  onChange={(e) => handleTotalDiscountChange(e.target.value)}
                  min={0}
                  max={100}
                  step={0.1}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Applies a {totalDiscountInput}% discount to the entire order.
              </p>
              <p className="text-lg font-semibold">
                Discount Amount:{" "}
                {formatCurrency(
                  (totalCartValue * totalDiscountInput) / 100,
                  settings.currencySymbol,
                  settings.decimalPlaces,
                )}
              </p>
            </div>
            <DialogFooter className="mt-auto pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleApplyTotalDiscountClick}>Apply Total Discount</Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="items" className="flex-1 flex flex-col p-4">
            {cartItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Cart is empty. Add items to apply discounts.</p>
            ) : (
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border p-3 rounded-md">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x{" "}
                          {formatCurrency(item.price, settings.currencySymbol, settings.decimalPlaces)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Current:{" "}
                          {formatCurrency(
                            calculateItemPriceAfterDiscount(item),
                            settings.currencySymbol,
                            settings.decimalPlaces,
                          )}{" "}
                          per item
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={itemDiscounts[item.id] || 0}
                          onChange={(e) => handleItemDiscountChange(item.id, e.target.value)}
                          className="w-24 text-right"
                          min={0}
                          max={100}
                          step={0.1}
                          placeholder="%"
                        />
                        <span className="text-sm">%</span>
                        <Button size="sm" onClick={() => handleApplyItemDiscountClick(item.id)}>
                          Apply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            <DialogFooter className="mt-auto pt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
