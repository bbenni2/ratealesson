import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { AuthUser } from '../lib/auth'

interface AuthContextValue {
  /** Eingeloggter User oder null wenn anonym unterwegs. */
  user: AuthUser | null
  /** true solange die Session beim App-Start geprüft wird. */
  loading: boolean
  /** Session manuell neu laden (z. B. nach username-Änderung). */
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function extractUser(su: User | null): AuthUser | null {
  if (!su) return null
  return {
    id: su.id,
    username:
      (su.user_metadata?.['username'] as string | undefined) ??
      su.email?.replace(/@ral\.internal$/, '') ??
      'unbekannt',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    setUser(extractUser(data.session?.user ?? null))
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()

    // Auf Login, Logout und Token-Refresh reagieren
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(extractUser(session?.user ?? null))
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [refresh])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, refresh }),
    [user, loading, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth muss in <AuthProvider> verwendet werden')
  return ctx
}
