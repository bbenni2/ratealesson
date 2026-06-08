// ════════════════════════════════════════════════════════════════
//  Auth-Hilfsfunktionen
//  Strategie: username-only – Supabase Auth nutzt intern eine
//  synthetische E-Mail (username@ral.internal), die der User nie sieht.
//  Die auth_email ist fest und ändert sich nie; nur profiles.username
//  ist variabel. Damit brauchen wir keine E-Mail-Änderungs-Bestätigung.
// ════════════════════════════════════════════════════════════════

import { supabase } from './supabase'

const EMAIL_DOMAIN = 'ral.internal'

export interface AuthUser {
  id: string
  username: string
}

// ── Interne Hilfsfunktionen ─────────────────────────────────────

function toEmail(username: string): string {
  return `${username.toLowerCase().trim()}@${EMAIL_DOMAIN}`
}

/** Supabase-Fehlermeldungen → verständliches Deutsch. */
function friendlyError(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login credentials') || m.includes('invalid password'))
    return 'Benutzername oder Passwort falsch.'
  if (m.includes('user already registered') || m.includes('already exists'))
    return 'Dieser Benutzername ist bereits registriert.'
  if (m.includes('password should be at least') || m.includes('weak password'))
    return 'Passwort muss mindestens 8 Zeichen lang sein.'
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Zu viele Versuche – bitte warte kurz und probiere es erneut.'
  if (m.includes('email not confirmed'))
    return 'Konto noch nicht aktiviert – bitte Admin informieren.'
  return msg
}

// ── Öffentliche Auth-Funktionen ─────────────────────────────────

/**
 * Legt einen neuen Account an.
 * Wirft einen Fehler wenn der Benutzername bereits vergeben ist.
 */
export async function signUp(username: string, password: string): Promise<AuthUser> {
  const lower = username.toLowerCase().trim()

  // Verfügbarkeit prüfen (profiles hat anon-SELECT → klappt vor dem Login)
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', lower)
    .maybeSingle()

  if (existing) throw new Error('Dieser Benutzername ist bereits vergeben.')

  const { data, error } = await supabase.auth.signUp({
    email: toEmail(lower),
    password,
    options: { data: { username: lower } },
  })

  if (error) throw new Error(friendlyError(error.message))
  if (!data.user) throw new Error('Registrierung fehlgeschlagen – bitte erneut versuchen.')

  return { id: data.user.id, username: lower }
}

/**
 * Meldet einen bestehenden Account an.
 * Die auth_email wird aus der profiles-Tabelle nachgeschlagen,
 * damit der User nie weiß, dass intern eine E-Mail existiert.
 */
export async function signIn(username: string, password: string): Promise<AuthUser> {
  const lower = username.toLowerCase().trim()

  // auth_email aus Profil-Tabelle holen (anon-lesbar)
  const { data: profile } = await supabase
    .from('profiles')
    .select('auth_email')
    .eq('username', lower)
    .maybeSingle()

  // Gleiche Fehlermeldung wie bei falschem PW → kein User-Enumeration-Angriff möglich
  if (!profile) throw new Error('Benutzername oder Passwort falsch.')

  const { data, error } = await supabase.auth.signInWithPassword({
    email: profile.auth_email,
    password,
  })

  if (error) throw new Error(friendlyError(error.message))
  if (!data.user) throw new Error('Anmeldung fehlgeschlagen – bitte erneut versuchen.')

  return { id: data.user.id, username: lower }
}

/** Meldet den eingeloggten Account ab. */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(friendlyError(error.message))
}

/**
 * Ändert den Benutzernamen.
 * Die interne auth_email bleibt unverändert – keine E-Mail-Bestätigung nötig.
 */
export async function updateUsername(newUsername: string): Promise<void> {
  const lower = newUsername.toLowerCase().trim()

  // Verfügbarkeit prüfen
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', lower)
    .maybeSingle()

  if (existing) throw new Error('Dieser Benutzername ist bereits vergeben.')

  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) throw new Error('Nicht angemeldet.')

  // Nur profiles.username ändern – auth_email bleibt stabil
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ username: lower })
    .eq('id', sessionData.session.user.id)

  if (profileError) throw new Error('Benutzername konnte nicht geändert werden.')

  // User-Metadaten aktualisieren (wird von useAuth gelesen)
  await supabase.auth.updateUser({ data: { username: lower } })
}

/**
 * Ändert das Passwort.
 * Das alte Passwort wird durch erneutes Anmelden verifiziert –
 * kein blinder Trust auf die laufende Session.
 */
export async function updatePassword(oldPassword: string, newPassword: string): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession()
  const email = sessionData.session?.user.email
  if (!email) throw new Error('Nicht angemeldet.')

  // Altes Passwort verifizieren
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: oldPassword,
  })
  if (verifyError) throw new Error('Altes Passwort ist falsch.')

  // Neues Passwort setzen
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) throw new Error(friendlyError(updateError.message))
}
