"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/lib/settings-context"
import { toast } from "@/hooks/use-toast"

export function OpenSooqSettingsForm() {
  const { settings, updateSettings } = useSettings()
  const [openSooqEnabled, setOpenSooqEnabled] = useState(settings.openSooq?.enabled || false)
  const [openSooqApiKey, setOpenSooqApiKey] = useState(settings.openSooq?.apiKey || "")
  const [openSooqStoreId, setOpenSooqStoreId] = useState(settings.openSooq?.storeId || "")

  useEffect(() => {
    setOpenSooqEnabled(settings.openSooq?.enabled || false)
    setOpenSooqApiKey(settings.openSooq?.apiKey || "")
    setOpenSooqStoreId(settings.openSooq?.storeId || "")
  }, [settings])

  const handleSave = () => {
    updateSettings({
      openSooq: {
        enabled: openSooqEnabled,
        apiKey: openSooqApiKey.trim(),
        storeId: openSooqStoreId.trim(),
      },
    })
    toast({
      title: "OpenSooq Settings Saved",
      description: "Your OpenSooq integration settings have been updated.",
    })
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="openSooqEnabled">Enable OpenSooq Integration</Label>
        <Switch id="openSooqEnabled" checked={openSooqEnabled} onCheckedChange={setOpenSooqEnabled} />
      </div>
      {openSooqEnabled && (
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="openSooqApiKey">API Key</Label>
            <Input
              id="openSooqApiKey"
              type="password"
              value={openSooqApiKey}
              onChange={(e) => setOpenSooqApiKey(e.target.value)}
              placeholder="Enter OpenSooq API Key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="openSooqStoreId">Store ID</Label>
            <Input
              id="openSooqStoreId"
              value={openSooqStoreId}
              onChange={(e) => setOpenSooqStoreId(e.target.value)}
              placeholder="Enter OpenSooq Store ID"
            />
          </div>
        </div>
      )}
      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  )
}
