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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DeliveryProvider } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import type { Settings } from "@/lib/settings-context"

interface ShippingModalProps {
  isOpen: boolean
  onClose: () => void
  currentShippingDetails: { address: string; cost: number; provider?: DeliveryProvider } | null
  deliveryProviders: DeliveryProvider[]
  onSaveShipping: (details: { address: string; cost: number; provider?: DeliveryProvider }) => void
  settings: Settings // Add settings prop
}

export function ShippingModal({
  isOpen,
  onClose,
  currentShippingDetails,
  deliveryProviders,
  onSaveShipping,
  settings,
}: ShippingModalProps) {
  const [address, setAddress] = useState(currentShippingDetails?.address || "")
  const [cost, setCost] = useState(currentShippingDetails?.cost || settings.shipping.defaultCost || 0)
  const [selectedProviderId, setSelectedProviderId] = useState(currentShippingDetails?.provider?.id || "")

  useEffect(() => {
    if (isOpen) {
      setAddress(currentShippingDetails?.address || "")
      setCost(currentShippingDetails?.cost || settings.shipping.defaultCost || 0)
      setSelectedProviderId(currentShippingDetails?.provider?.id || "")
    }
  }, [isOpen, currentShippingDetails, settings.shipping.defaultCost])

  const handleSave = () => {
    const selectedProvider = deliveryProviders.find((p) => p.id === selectedProviderId)
    onSaveShipping({
      address,
      cost: Number.parseFloat(cost.toString()), // Ensure cost is a number
      provider: selectedProvider,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Shipping Details</DialogTitle>
          <DialogDescription>Enter shipping address and cost for the order.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="shipping-address">Address</Label>
            <Input
              id="shipping-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter full shipping address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping-cost">Cost</Label>
            <Input
              id="shipping-cost"
              type="number"
              value={cost}
              onChange={(e) => setCost(Number.parseFloat(e.target.value))}
              min={0}
              step={0.01}
              placeholder={formatCurrency(
                settings.shipping.defaultCost || 0,
                settings.currencySymbol,
                settings.decimalPlaces,
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-provider">Delivery Provider</Label>
            <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
              <SelectTrigger id="delivery-provider">
                <SelectValue placeholder="Select a provider" />
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!address.trim() || cost < 0}>
            Save Shipping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
