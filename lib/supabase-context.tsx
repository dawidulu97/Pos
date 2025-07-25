"use client"

import type React from "react"
import { createContext, useContext, useMemo } from "react"
import { getBrowserStorageOperations } from "@/lib/browser-storage"

// Define the type for the context value
interface SupabaseContextType {
  dbOperations: ReturnType<typeof getBrowserStorageOperations>
}

// Create the context with a default undefined value
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  // Get browser storage operations directly
  const dbOperations = useMemo(() => getBrowserStorageOperations(), [])

  const contextValue = useMemo(
    () => ({
      dbOperations,
    }),
    [dbOperations],
  )

  return <SupabaseContext.Provider value={contextValue}>{children}</SupabaseContext.Provider>
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}
