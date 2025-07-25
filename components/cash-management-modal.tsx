"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import type { Settings } from "@/lib/settings-context"

interface CashManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onZReport: (data: { startAmount: number; endAmount: number; cashIn: number; cashOut: number }) => void
  onCashIn: (amount: number) => void
  onCashOut: (amount: number) => void
  currentCashInDrawer: number
  settings: Settings // Add settings prop
}

export function CashManagementModal({
  isOpen,
  onClose,
  onZReport,
  onCashIn,
  onCashOut,
  currentCashInDrawer,
  settings,
}: CashManagementModalProps) {
  const [zReportStartAmount, setZReportStartAmount] = useState(0)
  const [zReportEndAmount, setZReportEndAmount] = useState(0)
  const [zReportCashIn, setZReportCashIn] = useState(0)
  const [zReportCashOut, setZReportCashOut] = useState(0)

  const [cashInAmount, setCashInAmount] = useState(0)
  const [cashOutAmount, setCashOutAmount] = useState(0)

  useEffect(() => {
    if (isOpen) {
      // Reset Z-report fields and set current cash as start amount
      setZReportStartAmount(currentCashInDrawer)
      setZReportEndAmount(currentCashInDrawer) // Initially same as start
      setZReportCashIn(0)
      setZReportCashOut(0)
      setCashInAmount(0)
      setCashOutAmount(0)
    }
  }, [isOpen, currentCashInDrawer])

  const handleZReportGenerate = () => {
    onZReport({
      startAmount: zReportStartAmount,
      endAmount: currentCashInDrawer, // End amount is the current actual cash in drawer
      cashIn: zReportCashIn,
      cashOut: zReportCashOut,
    })
    onClose()
  }

  const handleCashInSubmit = () => {
    if (cashInAmount > 0) {
      onCashIn(cashInAmount)
      setZReportCashIn((prev) => prev + cashInAmount)
      setCashInAmount(0)
    }
  }

  const handleCashOutSubmit = () => {
    if (cashOutAmount > 0) {
      onCashOut(cashOutAmount)
      setZReportCashOut((prev) => prev + cashOutAmount)
      setCashOutAmount(0)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cash Management</DialogTitle>
          <DialogDescription>Manage cash drawer operations and generate Z-reports.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="cash-in-out" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cash-in-out">Cash In/Out</TabsTrigger>
            <TabsTrigger value="z-report">Z-Report</TabsTrigger>
          </TabsList>

          <TabsContent value="cash-in-out" className="flex-1 flex flex-col p-4">
            <div className="space-y-4">
              <div className="text-lg font-semibold">
                Current Cash in Drawer:{" "}
                {formatCurrency(currentCashInDrawer, settings.currencySymbol, settings.decimalPlaces)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cash-in-amount">Cash In Amount</Label>
                <div className="flex gap-2">
                  <Input
                    id="cash-in-amount"
                    type="number"
                    value={cashInAmount}
                    onChange={(e) => setCashInAmount(Number.parseFloat(e.target.value))}
                    min={0}
                    step={0.01}
                  />
                  <Button onClick={handleCashInSubmit} disabled={cashInAmount <= 0}>
                    Add Cash
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cash-out-amount">Cash Out Amount</Label>
                <div className="flex gap-2">
                  <Input
                    id="cash-out-amount"
                    type="number"
                    value={cashOutAmount}
                    onChange={(e) => setCashOutAmount(Number.parseFloat(e.target.value))}
                    min={0}
                    step={0.01}
                  />
                  <Button onClick={handleCashOutSubmit} disabled={cashOutAmount <= 0}>
                    Remove Cash
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-auto pt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="z-report" className="flex-1 flex flex-col p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Starting Cash</Label>
                <Input
                  value={formatCurrency(zReportStartAmount, settings.currencySymbol, settings.decimalPlaces)}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label>Cash In (from operations)</Label>
                <Input
                  value={formatCurrency(zReportCashIn, settings.currencySymbol, settings.decimalPlaces)}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label>Cash Out (from operations)</Label>
                <Input
                  value={formatCurrency(zReportCashOut, settings.currencySymbol, settings.decimalPlaces)}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label>Ending Cash (Current Drawer)</Label>
                <Input
                  value={formatCurrency(currentCashInDrawer, settings.currencySymbol, settings.decimalPlaces)}
                  readOnly
                />
              </div>
            </div>
            <DialogFooter className="mt-auto pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleZReportGenerate}>Generate Z-Report</Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
