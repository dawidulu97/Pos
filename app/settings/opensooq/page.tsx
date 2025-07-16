"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSettings } from "@/lib/settings-context"
import { OpenSooqSettingsForm } from "@/components/opensooq-settings-form"

export default function OpenSooqSettingsPage() {
  const { settings, updateSettings } = useSettings()

  return (
    <div className="flex-1 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>OpenSooq Integration Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <OpenSooqSettingsForm settings={settings} updateSettings={updateSettings} />
        </CardContent>
      </Card>
    </div>
  )
}
