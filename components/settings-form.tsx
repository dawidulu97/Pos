"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/lib/settings-context"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SettingsForm() {
  const { settings, updateSettings } = useSettings()
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol)
  const [decimalPlaces, setDecimalPlaces] = useState(settings.decimalPlaces)
  const [taxRate, setTaxRate] = useState(settings.taxRate * 100) // Display as percentage
  const [receiptPrinterEnabled, setReceiptPrinterEnabled] = useState(settings.receiptPrinterEnabled)
  const [openSooqEnabled, setOpenSooqEnabled] = useState(settings.openSooqEnabled)
  const [openSooqPhoneNumber, setOpenSooqPhoneNumber] = useState(settings.openSooqPhoneNumber || "")
  const [openSooqPassword, setOpenSooqPassword] = useState(settings.openSooqPassword || "")
  const [openSooqRepostTimer, setOpenSooqRepostTimer] = useState(settings.openSooqRepostTimer || 24)
  const [shippingEnabled, setShippingEnabled] = useState(settings.shipping.enabled)
  const [defaultShippingCost, setDefaultShippingCost] = useState(settings.shipping.defaultCost || 0)

  useEffect(() => {
    setCurrencySymbol(settings.currencySymbol)
    setDecimalPlaces(settings.decimalPlaces)
    setTaxRate(settings.taxRate * 100)
    setReceiptPrinterEnabled(settings.receiptPrinterEnabled)
    setOpenSooqEnabled(settings.openSooqEnabled)
    setOpenSooqPhoneNumber(settings.openSooqPhoneNumber || "")
    setOpenSooqPassword(settings.openSooqPassword || "")
    setOpenSooqRepostTimer(settings.openSooqRepostTimer || 24)
    setShippingEnabled(settings.shipping.enabled)
    setDefaultShippingCost(settings.shipping.defaultCost || 0)
  }, [settings])

  const handleSave = () => {
    updateSettings({
      currencySymbol,
      decimalPlaces,
      taxRate: taxRate / 100, // Store as decimal
      receiptPrinterEnabled,
      openSooqEnabled,
      openSooqPhoneNumber,
      openSooqPassword,
      openSooqRepostTimer,
      shipping: {
        enabled: shippingEnabled,
        defaultCost: defaultShippingCost,
      },
    })
    toast({
      title: "Settings Saved",
      description: "Your application settings have been updated.",
    })
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">General Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="currencySymbol">Currency Symbol</Label>
          <Input
            id="currencySymbol"
            value={currencySymbol}
            onChange={(e) => setCurrencySymbol(e.target.value)}
            placeholder="$"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="decimalPlaces">Decimal Places</Label>
          <Input
            id="decimalPlaces"
            type="number"
            value={decimalPlaces}
            onChange={(e) => setDecimalPlaces(Number.parseInt(e.target.value))}
            min={0}
            max={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxRate">Tax Rate (%)</Label>
          <Input
            id="taxRate"
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Number.parseFloat(e.target.value))}
            min={0}
            max={100}
            step={0.1}
          />
        </div>

        <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
          <Label htmlFor="receiptPrinterEnabled" className="flex flex-col space-y-1">
            <span className="text-base font-medium leading-none">Receipt Printer</span>
            <span className="text-sm text-muted-foreground">Enable physical receipt printing.</span>
          </Label>
          <Switch
            id="receiptPrinterEnabled"
            checked={receiptPrinterEnabled}
            onCheckedChange={setReceiptPrinterEnabled}
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mt-8">OpenSooq Integration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between space-x-2 rounded-md border p-4 col-span-full">
          <Label htmlFor="openSooqEnabled" className="flex flex-col space-y-1">
            <span className="text-base font-medium leading-none">Enable OpenSooq</span>
            <span className="text-sm text-muted-foreground">Integrate with OpenSooq for product publishing.</span>
          </Label>
          <Switch id="openSooqEnabled" checked={openSooqEnabled} onCheckedChange={setOpenSooqEnabled} />
        </div>

        {openSooqEnabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="openSooqPhoneNumber">OpenSooq Phone Number</Label>
              <Input
                id="openSooqPhoneNumber"
                value={openSooqPhoneNumber}
                onChange={(e) => setOpenSooqPhoneNumber(e.target.value)}
                placeholder="e.g., +962791234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openSooqPassword">OpenSooq Password</Label>
              <Input
                id="openSooqPassword"
                type="password"
                value={openSooqPassword}
                onChange={(e) => setOpenSooqPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openSooqRepostTimer">Auto Repost Timer (hours)</Label>
              <Select
                value={String(openSooqRepostTimer)}
                onValueChange={(value) => setOpenSooqRepostTimer(Number.parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select repost interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="6">6 Hours</SelectItem>
                  <SelectItem value="12">12 Hours</SelectItem>
                  <SelectItem value="24">24 Hours</SelectItem>
                  <SelectItem value="48">48 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mt-8">Shipping Settings</h2>
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
