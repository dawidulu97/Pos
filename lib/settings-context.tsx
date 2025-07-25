"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

export interface Settings {
  currencySymbol: string
  decimalPlaces: number
  taxRate: number // Stored as a decimal (e.g., 0.05 for 5%)
  receiptPrinterEnabled: boolean
  openSooqEnabled: boolean
  openSooqPhoneNumber?: string
  openSooqPassword?: string
  openSooqRepostTimer?: number // in hours
  shipping: {
    enabled: boolean
    defaultCost: number
  }
}

const defaultSettings: Settings = {
  currencySymbol: "$",
  decimalPlaces: 2,
  taxRate: 0.05, // 5%
  receiptPrinterEnabled: true,
  openSooqEnabled: false,
  openSooqPhoneNumber: "",
  openSooqPassword: "",
  openSooqRepostTimer: 24,
  shipping: {
    enabled: false,
    defaultCost: 5.0,
  },
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  // Load settings from localStorage on initial mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem("posSettings")
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings)
        // Merge with default settings to ensure all keys are present
        setSettings((prev) => ({
          ...prev,
          ...parsedSettings,
          shipping: {
            ...prev.shipping,
            ...parsedSettings.shipping,
          },
        }))
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error)
    }
  }, [])

  // Update settings and save to localStorage
  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        ...newSettings,
        shipping: {
          ...prev.shipping,
          ...newSettings.shipping,
        },
      }
      try {
        localStorage.setItem("posSettings", JSON.stringify(updated))
      } catch (error) {
        console.error("Failed to save settings to localStorage:", error)
      }
      return updated
    })
  }, [])

  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
