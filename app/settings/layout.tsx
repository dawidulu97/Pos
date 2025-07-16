import type React from "react"
import { Settings, Truck, Tag, Users } from "lucide-react"
import { SettingsTabs } from "@/components/settings-tabs"

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const sidebarNavItems = [
    {
      title: "General",
      href: "/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
    {
      title: "Shipping",
      href: "/settings/shipping",
      icon: <Truck className="mr-2 h-4 w-4" />,
    },
    {
      title: "Delivery Providers",
      href: "/settings/delivery-providers",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "OpenSooq Integration",
      href: "/settings/opensooq",
      icon: <Tag className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <div className="flex flex-col md:flex-row flex-1">
      <aside className="w-full md:w-64 p-4 md:p-6 border-b md:border-r md:border-b-0">
        <SettingsTabs />
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  )
}
