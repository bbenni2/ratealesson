import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * True, wenn die Supabase-Zugangsdaten gesetzt sind.
 * So kann die App auch ohne .env starten und einen Hinweis zeigen,
 * statt mit einem kryptischen Fehler abzustürzen.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Rate a Lesson] Supabase ist nicht konfiguriert. ' +
      'Lege eine .env mit VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY an.',
  )
}

export const supabase = createClient(
  url ?? 'http://localhost:54321',
  anonKey ?? 'public-anon-key-placeholder',
  {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 5 } },
  },
)
