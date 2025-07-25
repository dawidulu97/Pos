"use client"

import { DialogFooter } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import type { Settings } from "@/lib/settings-context"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface QrCodeModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  settings: Settings
}

export function QrCodeModal({ isOpen, onClose, product, settings }: QrCodeModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  
  useEffect(() => {
    if (isOpen && product) {
      // Generate QR code using a simple API instead of the library
      const qrData = product.sku || product.id
      const encodedData = encodeURIComponent(qrData)
      // Using Google Charts API to generate QR code
      const url = `https://chart.googleapis.com/chart?cht=qr&chl=${encodedData}&chs=256x256&choe=UTF-8&chld=L|2`
      setQrCodeUrl(url)
    }
  }, [isOpen, product])

  if (!product) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Product QR Code</DialogTitle>
          <DialogDescription>Scan this QR code to quickly add the product to cart.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 place-items-center">
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt={`QR Code for ${product.name}`}
              className="border p-2 rounded-md"
              width="256"
              height="256"
            />
          ) : (
            <div className="w-[256px] h-[256px] border p-2 rounded-md flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">Loading QR Code...</p>
            </div>
          )}
          <div className="space-y-1 text-center">
            <Label className="text-lg font-semibold">{product.name}</Label>
            <Input value={`SKU: ${product.sku || product.id}`} readOnly className="text-center font-mono text-sm" />
            <p className="text-muted-foreground text-sm">
              Price: {formatCurrency(product.price, settings.currencySymbol, settings.decimalPlaces)}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
