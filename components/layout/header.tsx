"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Settings, LayoutDashboard, Package, Users, DollarSign, ReceiptText } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
  const pathname = usePathname()

  const navItems = [
    { name: "POS", href: "/", icon: DollarSign },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/products", icon: Package },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Orders", href: "/orders", icon: ReceiptText },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-lg">CosyPOS</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === item.href ? "text-foreground" : "text-foreground/60",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-6 pt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 text-lg font-medium",
                      pathname === item.href ? "text-foreground" : "text-foreground/60",
                    )}
                    onClick={() => {
                      // Close sheet on navigation
                      document.getElementById("close-sheet")?.click()
                    }}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
