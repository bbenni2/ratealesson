import { useEffect, useRef, useState } from 'react'
import { signIn, signUp } from '../lib/auth'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { CloseIcon } from './icons'

// ── Validierung ─────────────────────────────────────────────────

const USERNAME_RE = /^[a-z0-9_-]+$/

function validateUsername(u: string): string | null {
  if (u.length < 3) return 'Mindestens 3 Zeichen.'
  if (u.length > 20) return 'Maximal 20 Zeichen.'
  if (!USERNAME_RE.test(u)) return 'Nur Kleinbuchstaben, Zahlen, _ und - erlaubt.'
  return null
}

function validatePassword(p: string): string | null {
  if (p.length < 8) return 'Mindestens 8 Zeichen.'
  if (!/[a-zA-Z]/.test(p)) return 'Muss mindestens einen Buchstaben enthalten.'
  if (!/[0-9!@#$%^&*()\-_=+[\]{};':",.<>/?\\|`~]/.test(p))
    return 'Muss mindestens eine Zahl oder ein Sonderzeichen enthalten.'
  return null
}

// ── Passwort-Stärke ─────────────────────────────────────────────

type Strength = 'weak' | 'medium' | 'strong'

function passwordStrength(pw: string): Strength {
  if (pw.length === 0) return 'weak'
  const hasLetter = /[a-zA-Z]/.test(pw)
  const hasDigit = /[0-9]/.test(pw)
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw)
  const variety = [hasLetter, hasDigit, hasSpecial].filter(Boolean).length
  if (pw.length >= 12 && variety >= 3) return 'strong'
  if (pw.length >= 8 && variety >= 2) return 'medium'
  return 'weak'
}

const STRENGTH_LABEL: Record<Strength, string> = {
  weak: 'Schwach',
  medium: 'Mittel',
  strong: 'Stark ✓',
}
const STRENGTH_COLOR: Record<Strength, string> = {
  weak: 'bg-red-400',
  medium: 'bg-amber',
  strong: 'bg-lime',
}
const STRENGTH_TEXT: Record<Strength, string> = {
  weak: 'text-red-400',
  medium: 'text-amber',
  strong: 'text-lime',
}
const STRENGTH_WIDTH: Record<Strength, string> = {
  weak: 'w-1/3',
  medium: 'w-2/3',
  strong: 'w-full',
}

// ── Komponente ──────────────────────────────────────────────────

interface Props {
  initialMode?: 'login' | 'register'
  onClose: () => void
}

export function AuthModal({ initialMode = 'login', onClose }: Props) {
  const { refresh } = useAuth()
  const { toast } = useToast()

  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const usernameRef = useRef<HTMLInputElement>(null)
  const isRegister = mode === 'register'
  const strength = passwordStrength(password)

  // Focus username on open
  useEffect(() => {
    const t = setTimeout(() => usernameRef.current?.focus(), 150)
    return () => clearTimeout(t)
  }, [])

  // ESC + scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // Felder bei Modus-Wechsel zurücksetzen
  useEffect(() => {
    setError(null)
    setPassword('')
    setConfirmPw('')
    setShowPw(false)
  }, [mode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const uErr = validateUsername(username)
    if (uErr) { setError(uErr); return }

    if (isRegister) {
      const pErr = validatePassword(password)
      if (pErr) { setError(pErr); return }
      if (password !== confirmPw) { setError('Passwörter stimmen nicht überein.'); return }
    } else {
      if (!password) { setError('Bitte gib dein Passwort ein.'); return }
    }

    setSubmitting(true)
    try {
      if (isRegister) {
        await signUp(username, password)
        toast('Willkommen! Konto erstellt 🎉', 'success')
      } else {
        await signIn(username, password)
        toast('Erfolgreich angemeldet! 👋', 'success')
      }
      await refresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[55] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-3xl border border-line bg-bg-soft p-5 pb-8 shadow-2xl animate-slide-up pb-safe sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Greif-Leiste */}
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">
            {isRegister ? 'Konto erstellen' : 'Anmelden'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="rounded-full p-1.5 text-white/40 transition hover:bg-bg-elevated hover:text-white"
          >
            <CloseIcon width={20} height={20} />
          </button>
        </div>

        {/* Modus-Tabs */}
        <div className="mt-4 flex gap-1 rounded-xl bg-bg-card p-1">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                mode === m
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {m === 'login' ? 'Anmelden' : 'Registrieren'}
            </button>
          ))}
        </div>

        {/* Sicherheitshinweis (nur beim Registrieren) */}
        {isRegister && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-xs leading-relaxed text-white/65">
            <span className="font-bold text-white/90">🔐 Sicherheitshinweis:</span>
            {' '}Verwende kein Passwort, das du woanders schon benutzt! Wenn bei einem anderen
            Dienst ein Datenleck passiert, wäre dein Konto hier ebenfalls gefährdet.
          </div>
        )}

        {/* Formular */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          {/* Benutzername */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/60">
              Benutzername
            </label>
            <input
              ref={usernameRef}
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={username}
              onChange={(e) => {
                // Nur erlaubte Zeichen, direkt lowercase
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                setError(null)
              }}
              placeholder="z. B. max_muster"
              maxLength={20}
              className="w-full rounded-xl border border-line bg-bg-card px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-accent/60"
            />
            {isRegister && (
              <p className="mt-1 text-[11px] text-white/35">
                3–20 Zeichen · Kleinbuchstaben, Zahlen, _ und -
              </p>
            )}
          </div>

          {/* Passwort */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/60">
              Passwort
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                placeholder={isRegister ? 'Mindestens 8 Zeichen' : 'Dein Passwort'}
                className="w-full rounded-xl border border-line bg-bg-card px-3.5 py-2.5 pr-11 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-accent/60"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? 'Passwort ausblenden' : 'Passwort anzeigen'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/35 transition hover:text-white/70 select-none"
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Stärken-Anzeige */}
            {isRegister && password.length > 0 && (
              <div className="mt-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${STRENGTH_COLOR[strength]} ${STRENGTH_WIDTH[strength]}`}
                  />
                </div>
                <p className={`mt-1 text-[11px] ${STRENGTH_TEXT[strength]}`}>
                  Stärke: {STRENGTH_LABEL[strength]}
                </p>
              </div>
            )}
          </div>

          {/* Passwort bestätigen */}
          {isRegister && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/60">
                Passwort bestätigen
              </label>
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPw}
                onChange={(e) => { setConfirmPw(e.target.value); setError(null) }}
                placeholder="Nochmals eingeben"
                className="w-full rounded-xl border border-line bg-bg-card px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-accent/60"
              />
            </div>
          )}

          {/* Fehler */}
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
              ⚠️ {error}
            </div>
          )}

          {/* Absenden */}
          <button
            type="submit"
            disabled={submitting || !username || !password}
            className="btn-primary w-full"
          >
            {submitting
              ? isRegister
                ? 'Registriere…'
                : 'Melde an…'
              : isRegister
                ? 'Konto erstellen'
                : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  )
}
