"use client"

import { useState, useEffect, useMemo } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import type { Customer } from "@/lib/supabase"

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customers: Customer[]
  onCustomerSelected: (customer: Customer) => void
  onCustomerSaved: (customer: Omit<Customer, "created_at" | "updated_at">) => Promise<void>
}

export function CustomerModal({ isOpen, onClose, customers, onCustomerSelected, onCustomerSaved }: CustomerModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [newCustomerName, setNewCustomerName] = useState("")
  const [newCustomerEmail, setNewCustomerEmail] = useState("")
  const [newCustomerPhone, setNewCustomerPhone] = useState("")
  const [newCustomerAddress, setNewCustomerAddress] = useState("")
  const [isAddingNew, setIsAddingNew] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("")
      setNewCustomerName("")
      setNewCustomerEmail("")
      setNewCustomerPhone("")
      setNewCustomerAddress("")
      setIsAddingNew(false)
    }
  }, [isOpen])

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [customers, searchTerm])

  const handleSaveNewCustomer = async () => {
    if (!newCustomerName.trim()) {
      alert("Customer name is required.")
      return
    }
    const newCustomer: Omit<Customer, "created_at" | "updated_at"> = {
      id: crypto.randomUUID(), // Generate a new UUID for the customer
      name: newCustomerName.trim(),
      email: newCustomerEmail.trim() || null,
      phone: newCustomerPhone.trim() || null,
      address: newCustomerAddress.trim() || null,
    }
    await onCustomerSaved(newCustomer)
    onCustomerSelected(newCustomer) // Select the newly added customer
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isAddingNew ? "Add New Customer" : "Select Customer"}</DialogTitle>
          <DialogDescription>
            {isAddingNew ? "Enter details for the new customer." : "Search for an existing customer or add a new one."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 flex-1 overflow-hidden">
          {!isAddingNew ? (
            <>
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />
              <ScrollArea className="flex-1 pr-4">
                {filteredCustomers.length === 0 ? (
                  <p className="text-center text-muted-foreground">No customers found.</p>
                ) : (
                  <div className="space-y-3">
                    {filteredCustomers.map((customer) => (
                      <Card
                        key={customer.id}
                        className="p-3 cursor-pointer hover:bg-accent/50"
                        onClick={() => onCustomerSelected(customer)}
                      >
                        <CardContent className="p-0">
                          <p className="font-medium">{customer.name}</p>
                          {customer.email && <p className="text-sm text-muted-foreground">{customer.email}</p>}
                          {customer.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newCustomerName">Name</Label>
                <Input
                  id="newCustomerName"
                  placeholder="Customer Name"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newCustomerEmail">Email</Label>
                <Input
                  id="newCustomerEmail"
                  type="email"
                  placeholder="customer@example.com"
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newCustomerPhone">Phone</Label>
                <Input
                  id="newCustomerPhone"
                  type="tel"
                  placeholder="555-123-4567"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newCustomerAddress">Address</Label>
                <Input
                  id="newCustomerAddress"
                  placeholder="123 Main St, Anytown"
                  value={newCustomerAddress}
                  onChange={(e) => setNewCustomerAddress(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          {!isAddingNew ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  onCustomerSelected({
                    id: "guest",
                    name: "Guest",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  })
                }
              >
                Select Guest
              </Button>
              <Button onClick={() => setIsAddingNew(true)}>Add New Customer</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                Back to Search
              </Button>
              <Button onClick={handleSaveNewCustomer}>Save Customer</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
