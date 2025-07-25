"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/lib/settings-context"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"

export function OpenSooqSettingsForm() {
  const { settings, updateSettings } = useSettings()
  const [openSooqEnabled, setOpenSooqEnabled] = useState(settings.openSooqEnabled)
  const [openSooqPhoneNumber, setOpenSooqPhoneNumber] = useState(settings.openSooqPhoneNumber || "")
  const [openSooqPassword, setOpenSooqPassword] = useState(settings.openSooqPassword || "")
  const [openSooqRepostTimer, setOpenSooqRepostTimer] = useState(settings.openSooqRepostTimer || 24)

  useEffect(() => {
    setOpenSooqEnabled(settings.openSooqEnabled)
    setOpenSooqPhoneNumber(settings.openSooqPhoneNumber || "")
    setOpenSooqPassword(settings.openSooqPassword || "")
    setOpenSooqRepostTimer(settings.openSooqRepostTimer || 24)
  }, [settings])

  const handleSave = () => {
    updateSettings({
      openSooqEnabled,
      openSooqPhoneNumber,
      openSooqPassword,
      openSooqRepostTimer,
    })
    toast({
      title: "Settings Saved",
      description: "OpenSooq integration settings have been updated.",
    })
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">OpenSooq Integration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between space-x-2 rounded-md border p-4 col-span-full">
          <Label htmlFor="openSooqEnabled" className="flex flex-col space-y-1">
            <span className="text-base font-medium leading-none">Enable OpenSooq</span>
            <span className="text-sm text-muted-foreground">Integrate with OpenSooq for product publishing.</span>
          </Label>
          <Switch id="openSooqEnabled" checked={openSooqEnabled} onCheckedChange={setOpenSooqEnabled} />
        </div>

        {openSooqEnabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="openSooqPhoneNumber">OpenSooq Phone Number</Label>
              <Input
                id="openSooqPhoneNumber"
                value={openSooqPhoneNumber}
                onChange={(e) => setOpenSooqPhoneNumber(e.target.value)}
                placeholder="e.g., +962791234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openSooqPassword">OpenSooq Password</Label>
              <Input
                id="openSooqPassword"
                type="password"
                value={openSooqPassword}
                onChange={(e) => setOpenSooqPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openSooqRepostTimer">Auto Repost Timer (hours)</Label>
              <Select
                value={String(openSooqRepostTimer)}
                onValueChange={(value) => setOpenSooqRepostTimer(Number.parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select repost interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="6">6 Hours</SelectItem>
                  <SelectItem value="12">12 Hours</SelectItem>
                  <SelectItem value="24">24 Hours</SelectItem>
                  <SelectItem value="48">48 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      <Button onClick={handleSave} className="mt-8">
        Save Settings
      </Button>
    </div>
  )
}
