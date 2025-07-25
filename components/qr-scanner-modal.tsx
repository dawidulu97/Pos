"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { QrCode, CameraOff } from "lucide-react"

interface QrScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onScan: (data: string) => void
}

export function QrScannerModal({ isOpen, onClose, onScan }: QrScannerModalProps) {
  const [manualInput, setManualInput] = useState("")
  
  // We're removing the QR scanner functionality and focusing on manual input
  // This avoids the errors with the HTML5QrcodeScanner library
  
  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim())
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enter Product SKU</DialogTitle>
          <DialogDescription>Enter the product's SKU manually to add it to the cart.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-md p-4 text-center">
            <CameraOff className="w-12 h-12 mb-4 text-gray-500" />
            <p className="font-semibold">Camera Scanner Temporarily Disabled</p>
            <p className="text-sm mt-2">
              Please use manual SKU entry below to add products to your cart.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-sku">Manual SKU Entry</Label>
            <Input
              id="manual-sku"
              placeholder="Enter product SKU"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleManualSubmit()
                }
              }}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleManualSubmit} disabled={!manualInput.trim()}>
            <QrCode className="w-4 h-4 mr-2" /> Submit SKU
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
