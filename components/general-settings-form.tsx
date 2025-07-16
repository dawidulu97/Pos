"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/lib/settings-context"
import { toast } from "@/hooks/use-toast"

export function GeneralSettingsForm() {
  const { settings, updateSettings } = useSettings()
  const [storeName, setStoreName] = useState(settings.storeName)
  const [taxRate, setTaxRate] = useState(settings.taxRate * 100)
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol)
  const [decimalPlaces, setDecimalPlaces] = useState(settings.decimalPlaces)
  const [receiptPrinterEnabled, setReceiptPrinterEnabled] = useState(settings.receiptPrinterEnabled)

  useEffect(() => {
    setStoreName(settings.storeName)
    setTaxRate(settings.taxRate * 100)
    setCurrencySymbol(settings.currencySymbol)
    setDecimalPlaces(settings.decimalPlaces)
    setReceiptPrinterEnabled(settings.receiptPrinterEnabled)
  }, [settings])

  const handleSave = () => {
    try {
      const newTaxRate = Number.parseFloat(taxRate.toString()) / 100
      if (isNaN(newTaxRate) || newTaxRate < 0 || newTaxRate > 1) {
        throw new Error("Tax rate must be a number between 0 and 100.")
      }
      if (storeName.trim() === "") {
        throw new Error("Store name cannot be empty.")
      }
      if (currencySymbol.trim() === "") {
        throw new Error("Currency symbol cannot be empty.")
      }
      if (isNaN(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 4) {
        throw new Error("Decimal places must be a number between 0 and 4.")
      }

      updateSettings({
        storeName,
        taxRate: newTaxRate,
        currencySymbol,
        decimalPlaces,
        receiptPrinterEnabled,
      })
      toast({
        title: "Settings Saved",
        description: "Your general settings have been updated.",
      })
    } catch (error: any) {
      toast({
        title: "Error Saving Settings",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="storeName">Store Name</Label>
          <Input
            id="storeName"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Enter store name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="taxRate">Tax Rate (%)</Label>
          <Input
            id="taxRate"
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Number.parseFloat(e.target.value))}
            placeholder="e.g., 5 for 5%"
            min={0}
            max={100}
            step={0.1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currencySymbol">Currency Symbol</Label>
          <Input
            id="currencySymbol"
            value={currencySymbol}
            onChange={(e) => setCurrencySymbol(e.target.value)}
            placeholder="e.g., $"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="decimalPlaces">Decimal Places</Label>
          <Input
            id="decimalPlaces"
            type="number"
            value={decimalPlaces}
            onChange={(e) => setDecimalPlaces(Number.parseInt(e.target.value))}
            placeholder="e.g., 2"
            min={0}
            max={4}
            step={1}
          />
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="receiptPrinterEnabled">Enable Receipt Printer</Label>
          <Switch
            id="receiptPrinterEnabled"
            checked={receiptPrinterEnabled}
            onCheckedChange={setReceiptPrinterEnabled}
          />
        </div>
      </div>
      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  )
}
