import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseProvider } from "@/lib/supabase-context"
import { SettingsProvider } from "@/lib/settings-context"
import { Header } from "@/components/layout/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "POS System",
  description: "A modern Point of Sale system built with Next.js and Supabase.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SupabaseProvider>
            <SettingsProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">{children}</main>
              </div>
            </SettingsProvider>
          </SupabaseProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
