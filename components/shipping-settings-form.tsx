"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/lib/settings-context"
import { toast } from "@/hooks/use-toast"

export function ShippingSettingsForm() {
  const { settings, updateSettings } = useSettings()
  const [shippingEnabled, setShippingEnabled] = useState(settings.shipping.enabled)

  useEffect(() => {
    setShippingEnabled(settings.shipping.enabled)
  }, [settings])

  const handleSave = () => {
    updateSettings({
      shipping: {
        enabled: shippingEnabled,
      },
    })
    toast({
      title: "Shipping Settings Saved",
      description: "Your shipping settings have been updated.",
    })
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="shippingEnabled">Enable Shipping</Label>
        <Switch id="shippingEnabled" checked={shippingEnabled} onCheckedChange={setShippingEnabled} />
      </div>
      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  )
}
