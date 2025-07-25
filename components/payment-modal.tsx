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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { useSettings } from "@/lib/settings-context"
import type { Customer, DeliveryProvider } from "@/lib/supabase"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  totalAmount: number
  onProcessPayment: (
    paymentMethod: string,
    amountPaid: number,
    changeDue: number,
    shippingDetails?: { address: string; cost: number; provider?: DeliveryProvider },
  ) => void
  shippingEnabled: boolean
  shippingDetails: { address: string; cost: number; provider?: DeliveryProvider } | null
  deliveryProviders: DeliveryProvider[]
  customer: Customer | null
}

export function PaymentModal({
  isOpen,
  onClose,
  totalAmount,
  onProcessPayment,
  shippingEnabled,
  shippingDetails,
  deliveryProviders,
  customer,
}: PaymentModalProps) {
  const { settings } = useSettings()
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [amountPaid, setAmountPaid] = useState(0)
  const [selectedDeliveryProvider, setSelectedDeliveryProvider] = useState<DeliveryProvider | undefined>(
    shippingDetails?.provider,
  )
  const [shippingAddress, setShippingAddress] = useState(shippingDetails?.address || "")
  const [shippingCost, setShippingCost] = useState(shippingDetails?.cost || settings.shipping.defaultCost || 0)

  const totalAmountWithShipping = useMemo(
    () => totalAmount + (shippingDetails?.cost || 0),
    [totalAmount, shippingDetails],
  )

  useEffect(() => {
    if (isOpen) {
      setAmountPaid(totalAmountWithShipping) // Pre-fill with total amount
      setPaymentMethod("cash")
      setShippingAddress(shippingDetails?.address || customer?.address || "")
      setShippingCost(shippingDetails?.cost || settings.shipping.defaultCost || 0)
      setSelectedDeliveryProvider(shippingDetails?.provider)
    }
  }, [isOpen, totalAmountWithShipping, shippingDetails, customer, settings.shipping.defaultCost])

  const changeDue = useMemo(() => {
    return amountPaid - totalAmountWithShipping
  }, [amountPaid, totalAmountWithShipping])

  const handleProcess = () => {
    let finalShippingDetails = undefined
    if (shippingEnabled && shippingAddress) {
      finalShippingDetails = {
        address: shippingAddress,
        cost: shippingCost,
        provider: selectedDeliveryProvider,
      }
    }
    onProcessPayment(paymentMethod, amountPaid, changeDue, finalShippingDetails)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>Complete the transaction for the current order.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total:</span>
            <span>{formatCurrency(totalAmountWithShipping, settings.currencySymbol, settings.decimalPlaces)}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="mobile_pay">Mobile Pay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount-paid">Amount Paid</Label>
            <Input
              id="amount-paid"
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(Number.parseFloat(e.target.value))}
              min={0}
              step={0.01}
            />
          </div>

          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Change Due:</span>
            <span className={changeDue < 0 ? "text-destructive" : "text-foreground"}>
              {formatCurrency(changeDue, settings.currencySymbol, settings.decimalPlaces)}
            </span>
          </div>

          {shippingEnabled && (
            <>
              <h3 className="text-lg font-semibold mt-4">Shipping Details</h3>
              <div className="space-y-2">
                <Label htmlFor="shipping-address">Shipping Address</Label>
                <Input
                  id="shipping-address"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter shipping address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping-cost">Shipping Cost</Label>
                <Input
                  id="shipping-cost"
                  type="number"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(Number.parseFloat(e.target.value))}
                  min={0}
                  step={0.01}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-provider">Delivery Provider</Label>
                <Select
                  value={selectedDeliveryProvider?.id || ""}
                  onValueChange={(value) => setSelectedDeliveryProvider(deliveryProviders.find((p) => p.id === value))}
                >
                  <SelectTrigger id="delivery-provider">
                    <SelectValue placeholder="Select delivery provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleProcess} disabled={amountPaid < totalAmountWithShipping}>
            Complete Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
