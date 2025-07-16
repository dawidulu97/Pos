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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { useSettings } from "@/lib/settings-context"
import type { Customer, DeliveryProvider } from "@/lib/supabase"

interface ShippingModalProps {
  isOpen: boolean
  onClose: () => void
  totalAmount: number
  onConfirmShipping: (details: {
    address: string
    city: string
    cost: number
    provider?: DeliveryProvider
  }) => void
  deliveryProviders: DeliveryProvider[]
  customer: Customer | null
}

export function ShippingModal({
  isOpen,
  onClose,
  totalAmount,
  onConfirmShipping,
  deliveryProviders,
  customer,
}: ShippingModalProps) {
  const { settings } = useSettings()
  const [address, setAddress] = useState(customer?.address || "")
  const [city, setCity] = useState("")
  const [selectedProviderId, setSelectedProviderId] = useState<string | undefined>(undefined)
  const [shippingCost, setShippingCost] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setAddress(customer?.address || "")
      setCity("")
      setSelectedProviderId(undefined)
      setShippingCost(0)
    }
  }, [isOpen, customer])

  const selectedProvider = selectedProviderId ? deliveryProviders.find((p) => p.id === selectedProviderId) : undefined

  // Simulate shipping cost calculation (e.g., based on distance or flat rate)
  useEffect(() => {
    if (selectedProvider) {
      // For simplicity, let's assume a flat rate or a dummy calculation
      // In a real app, this would involve more complex logic (e.g., API call to provider)
      setShippingCost(selectedProvider.cost_per_km || 5.0) // Example: flat 5.0 if cost_per_km is not set
    } else {
      setShippingCost(0)
    }
  }, [selectedProvider])

  const handleConfirm = () => {
    if (!address.trim() || !city.trim()) {
      alert("Please enter a valid address and city.")
      return
    }
    onConfirmShipping({
      address: address.trim(),
      city: city.trim(),
      cost: shippingCost,
      provider: selectedProvider,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Shipping Details</DialogTitle>
          <DialogDescription>Enter shipping information for the order.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="123 Main St"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="Anytown" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryProvider">Delivery Provider</Label>
            <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
              <SelectTrigger id="deliveryProvider">
                <SelectValue placeholder="Select a delivery provider" />
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
          <div className="flex justify-between items-center">
            <Label>Estimated Shipping Cost:</Label>
            <span className="font-bold">
              {formatCurrency(shippingCost, settings.currencySymbol, settings.decimalPlaces)}
            </span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold border-t pt-4 mt-4">
            <span>Total with Shipping:</span>
            <span>{formatCurrency(totalAmount + shippingCost, settings.currencySymbol, settings.decimalPlaces)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm Shipping</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
