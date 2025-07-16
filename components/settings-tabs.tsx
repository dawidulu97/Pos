"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function SettingsTabs() {
  const pathname = usePathname()

  const getActiveTab = () => {
    if (pathname.includes("/settings/payment-methods")) return "payment-methods"
    if (pathname.includes("/settings/shipping")) return "shipping"
    if (pathname.includes("/settings/delivery-providers")) return "delivery-providers"
    if (pathname.includes("/settings/opensooq")) return "opensooq"
    return "general" // Default to general settings
  }

  return (
    <Tabs defaultValue={getActiveTab()} className="w-full">
      <TabsList className="grid w-full grid-cols-1 md:grid-cols-5 h-auto">
        <TabsTrigger value="general" asChild>
          <Link href="/settings">General</Link>
        </TabsTrigger>
        <TabsTrigger value="payment-methods" asChild>
          <Link href="/settings/payment-methods">Payment Methods</Link>
        </TabsTrigger>
        <TabsTrigger value="shipping" asChild>
          <Link href="/settings/shipping">Shipping</Link>
        </TabsTrigger>
        <TabsTrigger value="delivery-providers" asChild>
          <Link href="/settings/delivery-providers">Delivery Providers</Link>
        </TabsTrigger>
        <TabsTrigger value="opensooq" asChild>
          <Link href="/settings/opensooq">OpenSooq</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
