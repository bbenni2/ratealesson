import { useEffect, useState } from 'react'

/**
 * Liefert die aktuelle Zeit und aktualisiert sich im Intervall.
 * @param intervalMs Update-Takt in ms (Default 1000 = jede Sekunde).
 */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}
