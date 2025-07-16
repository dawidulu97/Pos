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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { useSettings } from "@/lib/settings-context"
import { ShippingModal } from "@/components/shipping-modal"
import { toast } from "@/hooks/use-toast"
import type { Customer, DeliveryProvider } from "@/lib/supabase"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  totalAmount: number
  onProcessPayment: (
    paymentMethod: string,
    amountPaid: number,
    changeDue: number,
    shippingDetails?: { address: string; cost: number; provider?: DeliveryProvider; city?: string },
  ) => Promise<void>
  shippingEnabled: boolean
  shippingDetails: { address: string; cost: number; provider?: DeliveryProvider; city?: string } | null
  deliveryProviders: DeliveryProvider[]
  customer: Customer | null
}

export function PaymentModal({
  isOpen,
  onClose,
  totalAmount,
  onProcessPayment,
  shippingEnabled,
  shippingDetails: initialShippingDetails,
  deliveryProviders,
  customer,
}: PaymentModalProps) {
  const { settings } = useSettings()
  const [paymentMethod, setPaymentMethod] = useState(settings.paymentMethods?.[0]?.id || "cash")
  const [amountPaid, setAmountPaid] = useState(totalAmount.toFixed(settings.decimalPlaces))
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false)
  const [shippingDetails, setShippingDetails] = useState(initialShippingDetails)

  useEffect(() => {
    if (isOpen) {
      setAmountPaid(totalAmount.toFixed(settings.decimalPlaces))
      setPaymentMethod(settings.paymentMethods?.[0]?.id || "cash")
      setShippingDetails(initialShippingDetails)
    }
  }, [isOpen, totalAmount, settings.decimalPlaces, settings.paymentMethods, initialShippingDetails])

  const changeDue = useMemo(() => {
    const paid = Number.parseFloat(amountPaid) || 0
    return paid - (totalAmount + (shippingDetails?.cost || 0))
  }, [amountPaid, totalAmount, shippingDetails])

  const handleProcess = async () => {
    const paid = Number.parseFloat(amountPaid) || 0
    if (paid < totalAmount + (shippingDetails?.cost || 0)) {
      toast({
        title: "Payment Error",
        description: "Amount paid is less than the total amount due.",
        variant: "destructive",
      })
      return
    }
    await onProcessPayment(paymentMethod, paid, changeDue, shippingDetails || undefined)
    onClose()
  }

  const handleConfirmShipping = (details: {
    address: string
    city: string
    cost: number
    provider?: DeliveryProvider
  }) => {
    setShippingDetails(details)
    setIsShippingModalOpen(false)
  }

  const totalDue = totalAmount + (shippingDetails?.cost || 0)

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[475px]">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>Complete the transaction for the current order.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Due:</span>
              <span>{formatCurrency(totalDue, settings.currencySymbol, settings.decimalPlaces)}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {settings.paymentMethods?.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amountPaid">Amount Paid</Label>
              <Input
                id="amountPaid"
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder={totalDue.toFixed(settings.decimalPlaces)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
              <span>Change Due:</span>
              <span>{formatCurrency(changeDue, settings.currencySymbol, settings.decimalPlaces)}</span>
            </div>

            {shippingEnabled && (
              <div className="border-t pt-4 mt-4">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => setIsShippingModalOpen(true)}
                >
                  {shippingDetails ? "Edit Shipping Details" : "Add Shipping Details"}
                </Button>
                {shippingDetails && (
                  <div className="text-sm text-muted-foreground mt-2">
                    <p>
                      Shipping to: {shippingDetails.address}, {shippingDetails.city}
                    </p>
                    <p>
                      Cost: {formatCurrency(shippingDetails.cost, settings.currencySymbol, settings.decimalPlaces)} (
                      {shippingDetails.provider?.name || "N/A"})
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleProcess}>Complete Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {shippingEnabled && (
        <ShippingModal
          isOpen={isShippingModalOpen}
          onClose={() => setIsShippingModalOpen(false)}
          totalAmount={totalAmount}
          onConfirmShipping={handleConfirmShipping}
          deliveryProviders={deliveryProviders}
          customer={customer}
        />
      )}
    </>
  )
}
