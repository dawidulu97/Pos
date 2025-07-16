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
import QRCode from "qrcode.react" // Using a simple QR code library

interface QrCodeModalProps {
  isOpen: boolean
  onClose: () => void
  value: string
  title?: string
  description?: string
}

export function QrCodeModal({ isOpen, onClose, value, title, description }: QrCodeModalProps) {
  const [qrValue, setQrValue] = useState(value)

  useEffect(() => {
    setQrValue(value)
  }, [value])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title || "QR Code"}</DialogTitle>
          <DialogDescription>{description || "Scan this QR code."}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 place-items-center">
          {qrValue ? (
            <QRCode value={qrValue} size={256} level="H" includeMargin={true} />
          ) : (
            <div className="w-64 h-64 bg-gray-200 flex items-center justify-center text-muted-foreground">
              No QR Code Data
            </div>
          )}
          <div className="space-y-2 w-full">
            <Label htmlFor="qr-value">QR Code Value</Label>
            <Input id="qr-value" value={qrValue} readOnly className="text-center" />
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
