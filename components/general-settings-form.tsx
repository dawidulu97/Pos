"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/lib/settings-context"
import { toast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"

export function GeneralSettingsForm() {
  const { settings, updateSettings } = useSettings()
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol)
  const [decimalPlaces, setDecimalPlaces] = useState(settings.decimalPlaces)
  const [taxRate, setTaxRate] = useState(settings.taxRate * 100) // Display as percentage
  const [receiptPrinterEnabled, setReceiptPrinterEnabled] = useState(settings.receiptPrinterEnabled)

  useEffect(() => {
    setCurrencySymbol(settings.currencySymbol)
    setDecimalPlaces(settings.decimalPlaces)
    setTaxRate(settings.taxRate * 100)
    setReceiptPrinterEnabled(settings.receiptPrinterEnabled)
  }, [settings])

  const handleSave = () => {
    updateSettings({
      currencySymbol,
      decimalPlaces,
      taxRate: taxRate / 100, // Store as decimal
      receiptPrinterEnabled,
    })
    toast({
      title: "Settings Saved",
      description: "General settings have been updated.",
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

      <Button onClick={handleSave} className="mt-8">
        Save Settings
      </Button>
    </div>
  )
}
