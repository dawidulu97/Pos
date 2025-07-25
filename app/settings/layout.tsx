import type React from "react"
import Link from "next/link"
import { Settings, Truck, Tag, Users } from "lucide-react"
import { Card } from "@/components/ui/card"

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
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
        <nav className="flex flex-col gap-1">
          <h2 className="mb-4 px-2 text-lg font-semibold tracking-tight">Settings</h2>
          {sidebarNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex flex-1 flex-col p-4">
        <Card className="flex-1 p-6">{children}</Card>
      </main>
    </div>
  )
}
