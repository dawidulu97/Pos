"use client"

import { useState, useEffect, useCallback } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Trash2, Edit } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import type { Customer } from "@/lib/supabase"

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customers: Customer[]
  selectedCustomer: Customer | null
  onSelectCustomer: (customer: Customer) => void
  onCustomerSaved: (customer: Customer) => void
  onDeleteCustomer: (customerId: string) => void
}

export function CustomerModal({
  isOpen,
  onClose,
  customers,
  selectedCustomer,
  onSelectCustomer,
  onCustomerSaved,
  onDeleteCustomer,
}: CustomerModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("")
      setEditingCustomer(null)
      setIsEditing(false)
    }
  }, [isOpen])

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelect = useCallback(
    (customer: Customer) => {
      onSelectCustomer(customer)
      onClose()
    },
    [onSelectCustomer, onClose],
  )

  const handleNewCustomer = useCallback(() => {
    setEditingCustomer({
      id: uuidv4(),
      name: "",
      email: "",
      phone: "",
      address: "",
    })
    setIsEditing(true)
  }, [])

  const handleEditCustomer = useCallback((customer: Customer) => {
    setEditingCustomer({ ...customer }) // Create a copy to edit
    setIsEditing(true)
  }, [])

  const handleSaveCustomer = useCallback(() => {
    if (editingCustomer && editingCustomer.name) {
      onCustomerSaved(editingCustomer)
      setIsEditing(false)
      setEditingCustomer(null)
    }
  }, [editingCustomer, onCustomerSaved])

  const handleDelete = useCallback(
    (customerId: string) => {
      if (window.confirm("Are you sure you want to delete this customer?")) {
        onDeleteCustomer(customerId)
        if (editingCustomer?.id === customerId) {
          setEditingCustomer(null)
          setIsEditing(false)
        }
      }
    },
    [onDeleteCustomer, editingCustomer],
  )

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setEditingCustomer(null)
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Customer" : "Select Customer"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Fill in the customer details." : "Search for an existing customer or add a new one."}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Name</Label>
              <Input
                id="customerName"
                value={editingCustomer?.name || ""}
                onChange={(e) => setEditingCustomer((prev) => ({ ...prev!, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={editingCustomer?.email || ""}
                onChange={(e) => setEditingCustomer((prev) => ({ ...prev!, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                value={editingCustomer?.phone || ""}
                onChange={(e) => setEditingCustomer((prev) => ({ ...prev!, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress">Address</Label>
              <Input
                id="customerAddress"
                value={editingCustomer?.address || ""}
                onChange={(e) => setEditingCustomer((prev) => ({ ...prev!, address: e.target.value }))}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-2">
                {filteredCustomers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No customers found.</p>
                ) : (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className={`flex items-center justify-between p-3 rounded-md border cursor-pointer hover:bg-muted ${
                        selectedCustomer?.id === customer.id ? "bg-primary/10 border-primary" : ""
                      }`}
                      onClick={() => handleSelect(customer)}
                    >
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.phone || customer.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditCustomer(customer)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(customer.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </>
        )}

        <DialogFooter className="mt-4">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveCustomer} disabled={!editingCustomer?.name}>
                Save Customer
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleNewCustomer}>
                <Plus className="w-4 h-4 mr-2" /> New Customer
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
