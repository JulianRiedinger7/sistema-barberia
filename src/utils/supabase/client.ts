import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

// Keep singleton for legacy/other usages if needed, or remove. 
// For now, let's keep it compatible but generally we should use the function in components.
export const supabase = createClient()
