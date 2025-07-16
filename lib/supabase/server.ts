import { createClient } from "@supabase/supabase-js"
import type { Database } from "../database.types"
import { cookies } from "next/headers"
import { cache } from "react"

// Server-side Supabase client for Route Handlers and Server Components
export const createServerSupabaseClient = cache(() => {
  const cookieStore = cookies()
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `cookies().set()` method can only be called in a Server Context.
          // We're only calling this when rendering a Server Component, an RSC,
          // or an API route. This error is safe to ignore.
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // The `cookies().set()` method can only be called in a Server Context.
          // We're only calling this when rendering a Server Component, an RSC,
          // or an API route. This error is safe to ignore.
        }
      },
    },
  })
})

export { createServerSupabaseClient as createClient }