"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { PlusCircle, XCircle } from "lucide-react"
import { useSettings } from "@/lib/settings-context"
import { toast } from "@/hooks/use-toast"

interface PaymentMethod {
  id: string
  name: string
  isPaid: boolean // true if payment is considered "paid" immediately (e.g., cash, card), false for credit
}

export function PaymentMethodsSettingsForm() {
  const { settings, updateSettings } = useSettings()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(settings.paymentMethods || [])
  const [newMethodName, setNewMethodName] = useState("")
  const [newMethodIsPaid, setNewMethodIsPaid] = useState(true)

  useEffect(() => {
    setPaymentMethods(settings.paymentMethods || [])
  }, [settings])

  const handleAddMethod = () => {
    if (!newMethodName.trim()) {
      toast({
        title: "Invalid Input",
        description: "Payment method name cannot be empty.",
        variant: "destructive",
      })
      return
    }
    setPaymentMethods((prev) => [
      ...prev,
      { id: newMethodName.toLowerCase().replace(/\s/g, "-"), name: newMethodName.trim(), isPaid: newMethodIsPaid },
    ])
    setNewMethodName("")
    setNewMethodIsPaid(true)
  }

  const handleRemoveMethod = (id: string) => {
    setPaymentMethods((prev) => prev.filter((method) => method.id !== id))
  }

  const handleSave = () => {
    updateSettings({ paymentMethods })
    toast({
      title: "Payment Methods Saved",
      description: "Your payment method settings have been updated.",
    })
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newMethodName">Add New Payment Method</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="newMethodName"
              placeholder="Method Name (e.g., Cash, Card, Store Credit)"
              value={newMethodName}
              onChange={(e) => setNewMethodName(e.target.value)}
              className="flex-1"
            />
            <div className="flex items-center space-x-2">
              <Label htmlFor="newMethodIsPaid">Is Paid?</Label>
              <Switch id="newMethodIsPaid" checked={newMethodIsPaid} onCheckedChange={setNewMethodIsPaid} />
            </div>
            <Button size="icon" onClick={handleAddMethod}>
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {paymentMethods.length > 0 && (
          <div className="space-y-2">
            <Label>Configured Payment Methods</Label>
            <div className="border rounded-md p-3 space-y-2">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between text-sm">
                  <span>{method.name}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        method.isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {method.isPaid ? "Paid" : "Unpaid"}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveMethod(method.id)}>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  )
}
