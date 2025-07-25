"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/lib/settings-context"
import { toast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"

export function ShippingSettingsForm() {
  const { settings, updateSettings } = useSettings()
  const [shippingEnabled, setShippingEnabled] = useState(settings.shipping.enabled)
  const [defaultShippingCost, setDefaultShippingCost] = useState(settings.shipping.defaultCost || 0)

  useEffect(() => {
    setShippingEnabled(settings.shipping.enabled)
    setDefaultShippingCost(settings.shipping.defaultCost || 0)
  }, [settings])

  const handleSave = () => {
    updateSettings({
      shipping: {
        enabled: shippingEnabled,
        defaultCost: defaultShippingCost,
      },
    })
    toast({
      title: "Settings Saved",
      description: "Shipping settings have been updated.",
    })
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Shipping Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between space-x-2 rounded-md border p-4 col-span-full">
          <Label htmlFor="shippingEnabled" className="flex flex-col space-y-1">
            <span className="text-base font-medium leading-none">Enable Shipping</span>
            <span className="text-sm text-muted-foreground">Allow adding shipping details to orders.</span>
          </Label>
          <Switch id="shippingEnabled" checked={shippingEnabled} onCheckedChange={setShippingEnabled} />
        </div>

        {shippingEnabled && (
          <div className="space-y-2">
            <Label htmlFor="defaultShippingCost">Default Shipping Cost</Label>
            <Input
              id="defaultShippingCost"
              type="number"
              value={defaultShippingCost}
              onChange={(e) => setDefaultShippingCost(Number.parseFloat(e.target.value))}
              min={0}
              step={0.01}
            />
          </div>
        )}
      </div>

      <Button onClick={handleSave} className="mt-8">
        Save Settings
      </Button>
    </div>
  )
}
