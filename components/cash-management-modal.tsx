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
import { formatCurrency } from "@/lib/utils"
import { useSettings } from "@/lib/settings-context"
import { toast } from "@/hooks/use-toast"

interface CashManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onZReport: (data: { startAmount: number; endAmount: number; cashIn: number; cashOut: number }) => void
  onCashIn: (amount: number) => void
  onCashOut: (amount: number) => void
  currentCashInDrawer: number
}

export function CashManagementModal({
  isOpen,
  onClose,
  onZReport,
  onCashIn,
  onCashOut,
  currentCashInDrawer,
}: CashManagementModalProps) {
  const { settings } = useSettings()
  const [cashInAmount, setCashInAmount] = useState("")
  const [cashOutAmount, setCashOutAmount] = useState("")
  const [startOfDayCash, setStartOfDayCash] = useState(currentCashInDrawer) // This would ideally come from a persistent store

  useEffect(() => {
    if (!isOpen) {
      setCashInAmount("")
      setCashOutAmount("")
    } else {
      // When opening, if it's the first time or a new day, set start of day cash
      // For this demo, we'll just use the current drawer amount as start of day if not set
      if (startOfDayCash === 0 && currentCashInDrawer > 0) {
        setStartOfDayCash(currentCashInDrawer)
      }
    }
  }, [isOpen, currentCashInDrawer, startOfDayCash])

  const handleCashIn = () => {
    const amount = Number.parseFloat(cashInAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a positive number for cash in.",
        variant: "destructive",
      })
      return
    }
    onCashIn(amount)
    setCashInAmount("")
    toast({
      title: "Cash In Successful",
      description: `${formatCurrency(amount, settings.currencySymbol, settings.decimalPlaces)} added to drawer.`,
    })
  }

  const handleCashOut = () => {
    const amount = Number.parseFloat(cashOutAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a positive number for cash out.",
        variant: "destructive",
      })
      return
    }
    if (amount > currentCashInDrawer) {
      toast({
        title: "Insufficient Funds",
        description: "Cannot cash out more than available in drawer.",
        variant: "destructive",
      })
      return
    }
    onCashOut(amount)
    setCashOutAmount("")
    toast({
      title: "Cash Out Successful",
      description: `${formatCurrency(amount, settings.currencySymbol, settings.decimalPlaces)} removed from drawer.`,
    })
  }

  const handleZReport = () => {
    // In a real system, you'd fetch all transactions for the day
    // and calculate total cash in/out from those.
    // For this demo, we'll use the current state.
    const endAmount = currentCashInDrawer
    const cashInTotal = currentCashInDrawer - startOfDayCash // Simplified
    const cashOutTotal = 0 // Simplified, assuming cash out is only manual
    onZReport({
      startAmount: startOfDayCash,
      endAmount: endAmount,
      cashIn: cashInTotal,
      cashOut: cashOutTotal,
    })
    toast({ title: "Z-Report Generated", description: "Z-Report details logged to console." })
    // Reset start of day cash for next day (or next report)
    setStartOfDayCash(currentCashInDrawer)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Cash Management</DialogTitle>
          <DialogDescription>Manage cash drawer operations and generate reports.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Current Cash in Drawer:</span>
            <span>{formatCurrency(currentCashInDrawer, settings.currencySymbol, settings.decimalPlaces)}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cashInAmount">Cash In</Label>
            <div className="flex gap-2">
              <Input
                id="cashInAmount"
                type="number"
                value={cashInAmount}
                onChange={(e) => setCashInAmount(e.target.value)}
                placeholder="Amount to add"
                min="0"
                step="0.01"
              />
              <Button onClick={handleCashIn}>Add Cash</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cashOutAmount">Cash Out</Label>
            <div className="flex gap-2">
              <Input
                id="cashOutAmount"
                type="number"
                value={cashOutAmount}
                onChange={(e) => setCashOutAmount(e.target.value)}
                placeholder="Amount to remove"
                min="0"
                step="0.01"
              />
              <Button onClick={handleCashOut} variant="destructive">
                Remove Cash
              </Button>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <Button className="w-full" onClick={handleZReport}>
              Generate Z-Report
            </Button>
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
