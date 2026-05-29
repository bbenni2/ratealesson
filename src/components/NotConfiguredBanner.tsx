export function NotConfiguredBanner() {
  return (
    <div className="rounded-2xl border border-amber/40 bg-amber/10 p-4 text-sm animate-fade-in">
      <p className="font-display font-semibold text-amber">⚙️ Supabase fehlt noch</p>
      <p className="mt-1 text-white/60">
        Lege eine <code className="rounded bg-bg-elevated px-1">.env</code> mit{' '}
        <code className="rounded bg-bg-elevated px-1">VITE_SUPABASE_URL</code> und{' '}
        <code className="rounded bg-bg-elevated px-1">VITE_SUPABASE_ANON_KEY</code> an.
        Details stehen im README. Bis dahin werden keine Bewertungen geladen oder
        gespeichert.
      </p>
    </div>
  )
}
