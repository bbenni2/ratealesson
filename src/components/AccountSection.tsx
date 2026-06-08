import { useState } from 'react'
import { signOut, updatePassword, updateUsername } from '../lib/auth'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { AuthModal } from './AuthModal'

// ── Validierung ─────────────────────────────────────────────────

const USERNAME_RE = /^[a-z0-9_-]+$/

function validateUsername(u: string): string | null {
  if (u.length < 3) return 'Mindestens 3 Zeichen.'
  if (u.length > 20) return 'Maximal 20 Zeichen.'
  if (!USERNAME_RE.test(u)) return 'Nur Kleinbuchstaben, Zahlen, _ und -.'
  return null
}

function validatePassword(p: string): string | null {
  if (p.length < 8) return 'Mindestens 8 Zeichen.'
  if (!/[a-zA-Z]/.test(p)) return 'Muss mindestens einen Buchstaben enthalten.'
  if (!/[0-9!@#$%^&*()\-_=+[\]{};':",.<>/?\\|`~]/.test(p))
    return 'Muss mindestens eine Zahl oder ein Sonderzeichen enthalten.'
  return null
}

// ── Haupt-Komponente ────────────────────────────────────────────

export function AccountSection() {
  const { user, loading, refresh } = useAuth()
  const { toast } = useToast()

  const [showAuthModal, setShowAuthModal] = useState(false)

  // Benutzername ändern
  const [uExpanded, setUExpanded] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [uSubmitting, setUSubmitting] = useState(false)
  const [uError, setUError] = useState<string | null>(null)

  // Passwort ändern
  const [pwExpanded, setPwExpanded] = useState(false)
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwSubmitting, setPwSubmitting] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)

  // ── Handlers ───────────────────────────────────────────────────

  async function handleLogout() {
    if (!confirm('Wirklich abmelden?')) return
    try {
      await signOut()
      await refresh()
      toast('Abgemeldet.', 'info')
    } catch {
      toast('Abmelden fehlgeschlagen.', 'error')
    }
  }

  async function handleUsernameChange() {
    setUError(null)
    const err = validateUsername(newUsername)
    if (err) { setUError(err); return }
    setUSubmitting(true)
    try {
      await updateUsername(newUsername)
      await refresh()
      toast('Benutzername geändert ✏️', 'success')
      setNewUsername('')
      setUExpanded(false)
    } catch (e) {
      setUError(e instanceof Error ? e.message : 'Fehler.')
    } finally {
      setUSubmitting(false)
    }
  }

  async function handlePasswordChange() {
    setPwError(null)
    const err = validatePassword(newPw)
    if (err) { setPwError(err); return }
    if (newPw !== confirmPw) { setPwError('Passwörter stimmen nicht überein.'); return }
    setPwSubmitting(true)
    try {
      await updatePassword(oldPw, newPw)
      toast('Passwort aktualisiert 🔒', 'success')
      setOldPw('')
      setNewPw('')
      setConfirmPw('')
      setPwExpanded(false)
    } catch (e) {
      setPwError(e instanceof Error ? e.message : 'Fehler.')
    } finally {
      setPwSubmitting(false)
    }
  }

  // ── Render: Lade-Skeleton ───────────────────────────────────────
  if (loading) {
    return <div className="h-16 animate-pulse rounded-2xl bg-bg-card" />
  }

  // ── Render: Nicht angemeldet ────────────────────────────────────
  if (!user) {
    return (
      <>
        <div className="rounded-2xl border border-line bg-bg-card p-5 text-center">
          <p className="text-3xl">👤</p>
          <p className="mt-2 font-semibold text-white/80">Anonym unterwegs</p>
          <p className="mt-1 text-xs leading-relaxed text-white/40">
            Mit einem Konto kannst du deine Bewertungen später noch bearbeiten –
            auch auf einem anderen Gerät.
          </p>
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="btn-primary mt-4 w-full"
          >
            Anmelden / Konto erstellen
          </button>
        </div>

        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </>
    )
  }

  // ── Render: Angemeldet ──────────────────────────────────────────
  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-bg-card">
      {/* Account-Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 font-display text-sm font-bold text-accent">
          {user.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-white/40">Eingeloggt als</p>
          <p className="truncate font-semibold text-white">@{user.username}</p>
        </div>
      </div>

      {/* Benutzername ändern ─────────────────────────────── */}
      <div>
        <button
          type="button"
          onClick={() => { setUExpanded((e) => !e); setUError(null) }}
          className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-medium text-white/65 transition hover:text-white"
        >
          <span>✏️ Benutzername ändern</span>
          <span className="text-[10px] text-white/30">{uExpanded ? '▲' : '▼'}</span>
        </button>

        {uExpanded && (
          <div className="space-y-3 px-4 pb-4">
            <input
              type="text"
              autoCapitalize="none"
              spellCheck={false}
              value={newUsername}
              onChange={(e) => {
                setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                setUError(null)
              }}
              placeholder="Neuer Benutzername"
              maxLength={20}
              className="w-full rounded-xl border border-line bg-bg-elevated px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-accent/60"
            />
            {uError && <p className="text-xs text-red-300">⚠️ {uError}</p>}
            <button
              type="button"
              onClick={handleUsernameChange}
              disabled={uSubmitting || !newUsername}
              className="btn-primary w-full"
            >
              {uSubmitting ? 'Speichere…' : 'Speichern'}
            </button>
          </div>
        )}
      </div>

      {/* Passwort ändern ─────────────────────────────────── */}
      <div>
        <button
          type="button"
          onClick={() => { setPwExpanded((e) => !e); setPwError(null) }}
          className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-medium text-white/65 transition hover:text-white"
        >
          <span>🔒 Passwort ändern</span>
          <span className="text-[10px] text-white/30">{pwExpanded ? '▲' : '▼'}</span>
        </button>

        {pwExpanded && (
          <div className="space-y-3 px-4 pb-4">
            {/* Sicherheitshinweis */}
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs leading-relaxed text-white/60">
              <span className="font-bold text-white/85">🔐 Hinweis:</span>
              {' '}Verwende kein Passwort, das du woanders schon benutzt! Im Fall
              eines Datenlecks bei einem anderen Dienst wäre dein Konto hier
              ebenfalls gefährdet.
            </div>

            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={oldPw}
                onChange={(e) => { setOldPw(e.target.value); setPwError(null) }}
                placeholder="Altes Passwort"
                className="w-full rounded-xl border border-line bg-bg-elevated px-3.5 py-2.5 pr-11 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-accent/60"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? 'Passwörter ausblenden' : 'Passwörter anzeigen'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/35 transition hover:text-white/70"
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>

            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={newPw}
              onChange={(e) => { setNewPw(e.target.value); setPwError(null) }}
              placeholder="Neues Passwort (mind. 8 Zeichen)"
              className="w-full rounded-xl border border-line bg-bg-elevated px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-accent/60"
            />

            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPw}
              onChange={(e) => { setConfirmPw(e.target.value); setPwError(null) }}
              placeholder="Neues Passwort bestätigen"
              className="w-full rounded-xl border border-line bg-bg-elevated px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-accent/60"
            />

            {pwError && <p className="text-xs text-red-300">⚠️ {pwError}</p>}

            <button
              type="button"
              onClick={handlePasswordChange}
              disabled={pwSubmitting || !oldPw || !newPw || !confirmPw}
              className="btn-primary w-full"
            >
              {pwSubmitting ? 'Speichere…' : 'Passwort aktualisieren'}
            </button>
          </div>
        )}
      </div>

      {/* Abmelden */}
      <div className="p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-semibold text-red-300 transition active:scale-[0.98]"
        >
          Abmelden
        </button>
      </div>
    </div>
  )
}
