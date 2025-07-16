"use client"

import { Button } from "@/components/ui/button"
import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@supabase/supabase-js"
import { getDbOperations } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase"
import type { DbOperations } from "@/lib/supabase"

interface SupabaseContextType {
  supabase: SupabaseClient<Database> | null
  dbOperations: DbOperations
  loading: boolean
  error: string | null
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [dbOperations, setDbOperations] = useState<DbOperations>(null as any)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const initializeSupabase = useCallback(async () => {
    try {
      setLoading(true)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase URL and Anon Key are required.")
      }

      const client = createClient<Database>(supabaseUrl, supabaseAnonKey)
      setSupabase(client)
      setDbOperations(getDbOperations(client))
      setError(null)
    } catch (err: any) {
      console.error("Supabase initialization error:", err)
      setError(err.message || "Failed to initialize Supabase.")
      toast({
        title: "Supabase Connection Error",
        description: err.message || "Please check your environment variables.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    initializeSupabase()
  }, [initializeSupabase])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading application...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500">
        <p>Error: {error}</p>
        <Button onClick={initializeSupabase} className="mt-4">
          Retry Connection
        </Button>
      </div>
    )
  }

  return (
    <SupabaseContext.Provider value={{ supabase, dbOperations, loading, error }}>{children}</SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}
