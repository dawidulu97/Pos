import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsForm } from "@/components/settings-form"

export default function GeneralSettingsPage() {
  return (
    <div className="flex-1 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm />
        </CardContent>
      </Card>
    </div>
  )
}
