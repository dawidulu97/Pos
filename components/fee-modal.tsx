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
import { PlusCircle, XCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useSettings } from "@/lib/settings-context"
import { toast } from "@/hooks/use-toast"

interface Fee {
  id: string
  description: string
  amount: number
}

interface FeeModalProps {
  isOpen: boolean
  onClose: () => void
  currentFees: { description: string; amount: number }[]
  onApplyFees: (fees: { description: string; amount: number }[]) => void
}

export function FeeModal({ isOpen, onClose, currentFees, onApplyFees }: FeeModalProps) {
  const { settings } = useSettings()
  const [fees, setFees] = useState<Fee[]>(currentFees.map((f) => ({ ...f, id: crypto.randomUUID() })))
  const [newFeeDescription, setNewFeeDescription] = useState("")
  const [newFeeAmount, setNewFeeAmount] = useState("")

  useEffect(() => {
    setFees(currentFees.map((f) => ({ ...f, id: crypto.randomUUID() })))
    setNewFeeDescription("")
    setNewFeeAmount("")
  }, [currentFees, isOpen])

  const handleAddFee = () => {
    const amount = Number.parseFloat(newFeeAmount)
    if (!newFeeDescription.trim() || isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Fee",
        description: "Please enter a valid description and a positive amount for the fee.",
        variant: "destructive",
      })
      return
    }
    setFees((prev) => [...prev, { id: crypto.randomUUID(), description: newFeeDescription.trim(), amount: amount }])
    setNewFeeDescription("")
    setNewFeeAmount("")
  }

  const handleRemoveFee = (id: string) => {
    setFees((prev) => prev.filter((fee) => fee.id !== id))
  }

  const handleApply = () => {
    onApplyFees(fees.map(({ id, ...rest }) => rest)) // Remove the temporary 'id' before applying
    toast({
      title: "Fees Applied",
      description: `Applied ${fees.length} additional fees to the order.`,
    })
    onClose()
  }

  const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Additional Fees</DialogTitle>
          <DialogDescription>Add or manage additional fees for the current order.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newFeeDescription">Add New Fee</Label>
            <div className="flex gap-2">
              <Input
                id="newFeeDescription"
                placeholder="Fee description"
                value={newFeeDescription}
                onChange={(e) => setNewFeeDescription(e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Amount"
                value={newFeeAmount}
                onChange={(e) => setNewFeeAmount(e.target.value)}
                className="w-24"
                min="0"
                step="0.01"
              />
              <Button size="icon" onClick={handleAddFee}>
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {fees.length > 0 && (
            <div className="space-y-2">
              <Label>Current Fees</Label>
              <div className="border rounded-md p-3 space-y-2">
                {fees.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between text-sm">
                    <span>{fee.description}</span>
                    <div className="flex items-center gap-2">
                      <span>{formatCurrency(fee.amount, settings.currencySymbol, settings.decimalPlaces)}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveFee(fee.id)}>
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center font-bold border-t pt-2 mt-2">
                  <span>Total Additional Fees:</span>
                  <span>{formatCurrency(totalFees, settings.currencySymbol, settings.decimalPlaces)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Fees</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
