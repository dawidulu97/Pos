"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

export interface Settings {
  id?: string
  storeName: string
  taxRate: number
  currencySymbol: string
  decimalPlaces: number
  receiptPrinterEnabled: boolean
  paymentMethods?: { id: string; name: string; isPaid: boolean }[]
  shipping: {
    enabled: boolean
  }
  deliveryProviders?: { id: string; name: string; cost_per_km: number }[]
  openSooq?: {
    enabled: boolean
    apiKey: string
    storeId: string
  }
}

const defaultSettings: Settings = {
  storeName: "My POS",
  taxRate: 0.05,
  currencySymbol: "$",
  decimalPlaces: 2,
  receiptPrinterEnabled: false,
  paymentMethods: [
    { id: "cash", name: "Cash", isPaid: true },
    { id: "card", name: "Card", isPaid: true },
  ],
  shipping: {
    enabled: false,
  },
  deliveryProviders: [],
  openSooq: {
    enabled: false,
    apiKey: "",
    storeId: "",
  },
}

interface SettingsContextType {
  settings: Settings
  isLoading: boolean
  error: string | null
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase.from("settings").select("*").single()

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 means no rows found, which is fine for initial setup
        throw new Error(fetchError.message)
      }

      if (data) {
        // Merge fetched settings with defaults to ensure all properties exist
        setSettings((prev) => ({
          ...prev,
          ...data,
          paymentMethods: data.payment_methods || prev.paymentMethods,
          shipping: {
            enabled: data.shipping_enabled ?? prev.shipping.enabled,
          },
          deliveryProviders: data.delivery_providers || prev.deliveryProviders,
          openSooq: {
            enabled: data.opensooq_enabled ?? prev.openSooq?.enabled,
            apiKey: data.opensooq_api_key ?? prev.openSooq?.apiKey,
            storeId: data.opensooq_store_id ?? prev.openSooq?.storeId,
          },
          // Ensure taxRate is correctly parsed if stored as string/number
          taxRate: typeof data.tax_rate === "string" ? Number.parseFloat(data.tax_rate) : data.tax_rate,
          decimalPlaces:
            typeof data.decimal_places === "string" ? Number.parseInt(data.decimal_places) : data.decimal_places,
        }))
      } else {
        // If no settings found, insert default settings
        const { data: newSettingsData, error: insertError } = await supabase
          .from("settings")
          .insert({
            store_name: defaultSettings.storeName,
            tax_rate: defaultSettings.taxRate,
            currency_symbol: defaultSettings.currencySymbol,
            decimal_places: defaultSettings.decimalPlaces,
            receipt_printer_enabled: defaultSettings.receiptPrinterEnabled,
            payment_methods: defaultSettings.paymentMethods,
            shipping_enabled: defaultSettings.shipping.enabled,
            delivery_providers: defaultSettings.deliveryProviders,
            opensooq_enabled: defaultSettings.openSooq?.enabled,
            opensooq_api_key: defaultSettings.openSooq?.apiKey,
            opensooq_store_id: defaultSettings.openSooq?.storeId,
          })
          .select("*")
          .single()

        if (insertError) {
          throw new Error(insertError.message)
        }
        setSettings((prev) => ({
          ...prev,
          ...newSettingsData,
          paymentMethods: newSettingsData.payment_methods || prev.paymentMethods,
          shipping: {
            enabled: newSettingsData.shipping_enabled ?? prev.shipping.enabled,
          },
          deliveryProviders: newSettingsData.delivery_providers || prev.deliveryProviders,
          openSooq: {
            enabled: newSettingsData.opensooq_enabled ?? prev.openSooq?.enabled,
            apiKey: newSettingsData.opensooq_api_key ?? prev.openSooq?.apiKey,
            storeId: newSettingsData.opensooq_store_id ?? prev.openSooq?.storeId,
          },
          taxRate:
            typeof newSettingsData.tax_rate === "string"
              ? Number.parseFloat(newSettingsData.tax_rate)
              : newSettingsData.tax_rate,
          decimalPlaces:
            typeof newSettingsData.decimal_places === "string"
              ? Number.parseInt(newSettingsData.decimal_places)
              : newSettingsData.decimal_places,
        }))
      }
    } catch (err: any) {
      console.error("Failed to fetch or initialize settings:", err)
      setError(err.message || "Failed to load settings.")
      toast({
        title: "Settings Load Error",
        description: err.message || "Failed to load settings from database.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSettingsInDb = useCallback(
    async (newSettings: Partial<Settings>) => {
      setIsLoading(true)
      setError(null)
      try {
        const { data, error: updateError } = await supabase
          .from("settings")
          .update({
            store_name: newSettings.storeName ?? settings.storeName,
            tax_rate: newSettings.taxRate ?? settings.taxRate,
            currency_symbol: newSettings.currencySymbol ?? settings.currencySymbol,
            decimal_places: newSettings.decimalPlaces ?? settings.decimalPlaces,
            receipt_printer_enabled: newSettings.receiptPrinterEnabled ?? settings.receiptPrinterEnabled,
            payment_methods: newSettings.paymentMethods ?? settings.paymentMethods,
            shipping_enabled: newSettings.shipping?.enabled ?? settings.shipping.enabled,
            delivery_providers: newSettings.deliveryProviders ?? settings.deliveryProviders,
            opensooq_enabled: newSettings.openSooq?.enabled ?? settings.openSooq?.enabled,
            opensooq_api_key: newSettings.openSooq?.apiKey ?? settings.openSooq?.apiKey,
            opensooq_store_id: newSettings.openSooq?.storeId ?? settings.openSooq?.storeId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", settings.id)
          .select("*")
          .single()

        if (updateError) {
          throw new Error(updateError.message)
        }

        if (data) {
          setSettings((prev) => ({
            ...prev,
            ...data,
            paymentMethods: data.payment_methods || prev.paymentMethods,
            shipping: {
              enabled: data.shipping_enabled ?? prev.shipping.enabled,
            },
            deliveryProviders: data.delivery_providers || prev.deliveryProviders,
            openSooq: {
              enabled: data.opensooq_enabled ?? prev.openSooq?.enabled,
              apiKey: data.opensooq_api_key ?? prev.openSooq?.apiKey,
              storeId: data.opensooq_store_id ?? prev.openSooq?.storeId,
            },
            taxRate: typeof data.tax_rate === "string" ? Number.parseFloat(data.tax_rate) : data.tax_rate,
            decimalPlaces:
              typeof data.decimal_places === "string" ? Number.parseInt(data.decimal_places) : data.decimal_places,
          }))
        }
      } catch (err: any) {
        console.error("Failed to update settings:", err)
        setError(err.message || "Failed to save settings.")
        toast({
          title: "Settings Save Error",
          description: err.message || "Failed to save settings to database.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, settings],
  )

  const refreshSettings = useCallback(async () => {
    await fetchSettings()
  }, [fetchSettings])

  return (
    <SettingsContext.Provider
      value={{ settings, isLoading, error, updateSettings: updateSettingsInDb, refreshSettings }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
