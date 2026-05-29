import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchRatings } from '../lib/ratings'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useStudentConfig } from './useStudentConfig'
import type { Rating } from '../types'

interface RatingsContextValue {
  ratings: Rating[]
  loading: boolean
  error: string | null
  /** Optimistisch eine Bewertung anhängen (vor/parallel zum Realtime-Event). */
  addLocal: (rating: Rating) => void
  reload: () => void
}

const RatingsContext = createContext<RatingsContextValue | null>(null)

/**
 * Lädt alle relevanten Bewertungen einmal und hält sie via
 * Supabase-Realtime live aktuell. Wird app-weit geteilt, damit
 * Live-, Stats- & History-Ansicht denselben Datenstand nutzen.
 */
export function RatingsProvider({ children }: { children: ReactNode }) {
  const { config } = useStudentConfig()
  const className = config.className

  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      setError('not-configured')
      return
    }
    try {
      setLoading(true)
      const data = await fetchRatings(className)
      setRatings(data)
      setError(null)
    } catch (e) {
      console.error(e)
      setError('load-failed')
    } finally {
      setLoading(false)
    }
  }, [className])

  const addLocal = useCallback((rating: Rating) => {
    setRatings((prev) => {
      if (prev.some((r) => r.id === rating.id)) return prev
      return [rating, ...prev]
    })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Realtime: neue Bewertungen live einspielen.
  useEffect(() => {
    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel(`ratings-stream-${className}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ratings',
          filter: `class_code=eq.${className}`,
        },
        (payload) => {
          const incoming = { ...payload.new, stars: Number(payload.new.stars) } as Rating
          setRatings((prev) =>
            prev.some((r) => r.id === incoming.id) ? prev : [incoming, ...prev],
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [className])

  const value = useMemo<RatingsContextValue>(
    () => ({ ratings, loading, error, addLocal, reload: load }),
    [ratings, loading, error, addLocal, load],
  )

  return <RatingsContext.Provider value={value}>{children}</RatingsContext.Provider>
}

export function useRatings(): RatingsContextValue {
  const ctx = useContext(RatingsContext)
  if (!ctx) throw new Error('useRatings muss innerhalb von <RatingsProvider> stehen')
  return ctx
}
