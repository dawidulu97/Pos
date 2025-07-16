import { createClient } from "@supabase/supabase-js"
import type { Database } from "../database.types"

// Client-side Supabase client (singleton pattern)
let supabaseBrowserClient: ReturnType<typeof createClient> | null = null

export function createBrowserSupabaseClient() {
  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return supabaseBrowserClient
}

export { createBrowserSupabaseClient as createClient }