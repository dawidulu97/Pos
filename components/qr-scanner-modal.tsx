"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

interface QrScannerModalProps {
  isOpen: boolean
  onClose: () => void
  /** Will receive the scanned SKU (simulated in preview) */
  onScanResult: (sku: string) => void
}

/**
 * Stubbed QR-code scanner.
 *
 * - In a real POS device we would mount a camera stream here and read QR codes.
 * - In the preview we show a simple dialog and offer a *Simulate Scan* button
 *   to pass a hard-coded SKU back to the parent component.
 */
export function QrScannerModal({ isOpen, onClose, onScanResult }: QrScannerModalProps) {
  /* Optional: focus the dialog when it opens */
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => {
      /* auto-close after 30 s to avoid forgotten overlays */
      onClose()
    }, 30_000)
    return () => clearTimeout(timer)
  }, [isOpen, onClose])

  const handleSimulate = () => {
    onScanResult("DEMO-SKU-123")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>QR Scanner (Preview)</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Camera-based scanning is disabled in this online preview.
          <br />
          Use the button below to simulate reading a QR code.
        </p>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="secondary" onClick={handleSimulate}>
            Simulate Scan
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
