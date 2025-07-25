"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2 } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { useSupabase } from "@/lib/supabase-context"
import { toast } from "@/hooks/use-toast"
import type { DeliveryProvider } from "@/lib/supabase"

interface EditableDeliveryProvider extends DeliveryProvider {
  isNew?: boolean
}

export function DeliveryProvidersSettingsForm() {
  const { dbOperations } = useSupabase()
  const [providers, setProviders] = useState<EditableDeliveryProvider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true)
      const { data, error } = await dbOperations.getDeliveryProviders()
      if (error) {
        console.error("Error fetching delivery providers:", error)
        toast({
          title: "Error",
          description: `Failed to load delivery providers: ${error.message}`,
          variant: "destructive",
        })
        setProviders([])
      } else {
        setProviders(data || [])
      }
      setLoading(false)
    }
    fetchProviders()
  }, [dbOperations])

  const handleAddProvider = useCallback(() => {
    setProviders((prev) => [
      ...prev,
      {
        id: uuidv4(),
        name: "",
        contact_phone: "",
        contact_email: "",
        is_active: true,
        isNew: true,
      },
    ])
  }, [])

  const handleProviderChange = useCallback((id: string, field: keyof EditableDeliveryProvider, value: any) => {
    setProviders((prev) =>
      prev.map((provider) =>
        provider.id === id
          ? {
              ...provider,
              [field]: value,
            }
          : provider,
      ),
    )
  }, [])

  const handleSaveProvider = useCallback(
    async (providerToSave: EditableDeliveryProvider) => {
      if (!providerToSave.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Provider name cannot be empty.",
          variant: "destructive",
        })
        return
      }

      if (providerToSave.isNew) {
        const { data, error } = await dbOperations.addDeliveryProvider(providerToSave)
        if (error) {
          console.error("Error adding provider:", error)
          toast({
            title: "Error",
            description: `Failed to add provider: ${error.message}`,
            variant: "destructive",
          })
        } else {
          setProviders((prev) => prev.map((p) => (p.id === providerToSave.id ? { ...data!, isNew: false } : p)))
          toast({
            title: "Provider Added",
            description: `${data?.name} has been added.`,
          })
        }
      } else {
        const { data, error } = await dbOperations.updateDeliveryProvider(providerToSave)
        if (error) {
          console.error("Error updating provider:", error)
          toast({
            title: "Error",
            description: `Failed to update provider: ${error.message}`,
            variant: "destructive",
          })
        } else {
          setProviders((prev) => prev.map((p) => (p.id === providerToSave.id ? { ...data!, isNew: false } : p)))
          toast({
            title: "Provider Updated",
            description: `${data?.name} has been updated.`,
          })
        }
      }
    },
    [dbOperations],
  )

  const handleDeleteProvider = useCallback(
    async (id: string) => {
      if (window.confirm("Are you sure you want to delete this delivery provider?")) {
        const { error } = await dbOperations.deleteDeliveryProvider(id)
        if (error) {
          console.error("Error deleting provider:", error)
          toast({
            title: "Error",
            description: `Failed to delete provider: ${error.message}`,
            variant: "destructive",
          })
        } else {
          setProviders((prev) => prev.filter((p) => p.id !== id))
          toast({
            title: "Provider Deleted",
            description: "Delivery provider has been removed.",
            variant: "destructive",
          })
        }
      }
    },
    [dbOperations],
  )

  if (loading) {
    return <div className="text-center py-8">Loading delivery providers...</div>
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Delivery Providers</h2>
      <p className="text-muted-foreground">Manage the delivery services available for shipping orders.</p>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {providers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No delivery providers added yet.</p>
          ) : (
            providers.map((provider) => (
              <div key={provider.id} className="border p-4 rounded-md space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${provider.id}`}>Provider Name</Label>
                    <Input
                      id={`name-${provider.id}`}
                      value={provider.name}
                      onChange={(e) => handleProviderChange(provider.id, "name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`phone-${provider.id}`}>Contact Phone</Label>
                    <Input
                      id={`phone-${provider.id}`}
                      value={provider.contact_phone || ""}
                      onChange={(e) => handleProviderChange(provider.id, "contact_phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`email-${provider.id}`}>Contact Email</Label>
                    <Input
                      id={`email-${provider.id}`}
                      type="email"
                      value={provider.contact_email || ""}
                      onChange={(e) => handleProviderChange(provider.id, "contact_email", e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
                    <Label htmlFor={`active-${provider.id}`} className="flex flex-col space-y-1">
                      <span className="text-base font-medium leading-none">Active</span>
                      <span className="text-sm text-muted-foreground">Toggle provider availability.</span>
                    </Label>
                    <Switch
                      id={`active-${provider.id}`}
                      checked={provider.is_active}
                      onCheckedChange={(checked) => handleProviderChange(provider.id, "is_active", checked)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleSaveProvider(provider)}
                    disabled={!provider.name.trim()}
                  >
                    {provider.isNew ? "Add Provider" : "Update Provider"}
                  </Button>
                  <Button variant="destructive" onClick={() => handleDeleteProvider(provider.id)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <Button onClick={handleAddProvider} className="mt-8">
        <Plus className="w-4 h-4 mr-2" /> Add New Provider
      </Button>
    </div>
  )
}
