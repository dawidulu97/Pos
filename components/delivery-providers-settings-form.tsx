"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, XCircle } from "lucide-react"
import { useSettings } from "@/lib/settings-context"
import { toast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

interface DeliveryProvider {
  id: string
  name: string
  cost_per_km: number // Example: cost per kilometer
}

export function DeliveryProvidersSettingsForm() {
  const { settings, updateSettings } = useSettings()
  const [providers, setProviders] = useState<DeliveryProvider[]>(settings.deliveryProviders || [])
  const [newProviderName, setNewProviderName] = useState("")
  const [newProviderCost, setNewProviderCost] = useState("")

  useEffect(() => {
    setProviders(settings.deliveryProviders || [])
  }, [settings])

  const handleAddProvider = () => {
    const cost = Number.parseFloat(newProviderCost)
    if (!newProviderName.trim() || isNaN(cost) || cost < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid name and a non-negative cost for the delivery provider.",
        variant: "destructive",
      })
      return
    }
    setProviders((prev) => [...prev, { id: crypto.randomUUID(), name: newProviderName.trim(), cost_per_km: cost }])
    setNewProviderName("")
    setNewProviderCost("")
  }

  const handleRemoveProvider = (id: string) => {
    setProviders((prev) => prev.filter((provider) => provider.id !== id))
  }

  const handleSave = () => {
    updateSettings({ deliveryProviders: providers })
    toast({
      title: "Delivery Providers Saved",
      description: "Your delivery provider settings have been updated.",
    })
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newProviderName">Add New Provider</Label>
          <div className="flex gap-2">
            <Input
              id="newProviderName"
              placeholder="Provider Name"
              value={newProviderName}
              onChange={(e) => setNewProviderName(e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Cost per KM"
              value={newProviderCost}
              onChange={(e) => setNewProviderCost(e.target.value)}
              className="w-32"
              min="0"
              step="0.01"
            />
            <Button size="icon" onClick={handleAddProvider}>
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {providers.length > 0 && (
          <div className="space-y-2">
            <Label>Configured Providers</Label>
            <div className="border rounded-md p-3 space-y-2">
              {providers.map((provider) => (
                <div key={provider.id} className="flex items-center justify-between text-sm">
                  <span>{provider.name}</span>
                  <div className="flex items-center gap-2">
                    <span>
                      {formatCurrency(provider.cost_per_km, settings.currencySymbol, settings.decimalPlaces)} / KM
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveProvider(provider.id)}>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  )
}
