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
import { Plus, Trash2 } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency } from "@/lib/utils"
import type { Settings } from "@/lib/settings-context"

interface Fee {
  id: string
  description: string
  amount: number
}

interface FeeModalProps {
  isOpen: boolean
  onClose: () => void
  currentFees: { description: string; amount: number }[]
  onSaveFees: (fees: { description: string; amount: number }[]) => void
  settings: Settings // Add settings prop
}

export function FeeModal({ isOpen, onClose, currentFees, onSaveFees, settings }: FeeModalProps) {
  const [fees, setFees] = useState<Fee[]>([])

  useEffect(() => {
    if (isOpen) {
      // Assign unique IDs to currentFees for easier management
      setFees(currentFees.map((fee) => ({ ...fee, id: fee.id || uuidv4() })))
    }
  }, [isOpen, currentFees])

  const handleAddFee = () => {
    setFees((prev) => [...prev, { id: uuidv4(), description: "", amount: 0 }])
  }

  const handleFeeChange = (id: string, field: keyof Fee, value: string | number) => {
    setFees((prev) =>
      prev.map((fee) =>
        fee.id === id
          ? {
              ...fee,
              [field]: field === "amount" ? (isNaN(Number(value)) ? 0 : Number(value)) : value,
            }
          : fee,
      ),
    )
  }

  const handleRemoveFee = (id: string) => {
    setFees((prev) => prev.filter((fee) => fee.id !== id))
  }

  const handleSave = () => {
    // Filter out fees with empty description or zero amount if desired, or validate
    const validFees = fees.filter((fee) => fee.description.trim() !== "" && fee.amount > 0)
    onSaveFees(validFees.map(({ id, ...rest }) => rest)) // Remove the temporary ID before saving
    onClose()
  }

  const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Additional Fees</DialogTitle>
          <DialogDescription>
            Add any extra charges to the order (e.g., delivery fee, service charge).
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 py-4 pr-4">
          <div className="grid gap-4">
            {fees.map((fee) => (
              <div key={fee.id} className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`fee-description-${fee.id}`}>Description</Label>
                  <Input
                    id={`fee-description-${fee.id}`}
                    value={fee.description}
                    onChange={(e) => handleFeeChange(fee.id, "description", e.target.value)}
                    placeholder="e.g., Delivery Fee"
                  />
                </div>
                <div className="w-28 space-y-2">
                  <Label htmlFor={`fee-amount-${fee.id}`}>Amount</Label>
                  <Input
                    id={`fee-amount-${fee.id}`}
                    type="number"
                    value={fee.amount}
                    onChange={(e) => handleFeeChange(fee.id, "amount", e.target.value)}
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                  />
                </div>
                <Button variant="destructive" size="icon" onClick={() => handleRemoveFee(fee.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={handleAddFee} className="mt-2 bg-transparent">
              <Plus className="w-4 h-4 mr-2" /> Add Fee
            </Button>
          </div>
        </ScrollArea>
        <div className="flex justify-between items-center font-bold text-lg mt-4 pt-4 border-t">
          <span>Total Fees:</span>
          <span>{formatCurrency(totalFees, settings.currencySymbol, settings.decimalPlaces)}</span>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Fees</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
