// Verhindert Doppel-Bewertungen pro Gerät via localStorage.
// v2-Format: Record<lessonKey, ratingId> – ermöglicht auch nachträgliches Bearbeiten.

const KEY_V2 = 'ral:ratings-v2'
const KEY_LEGACY = 'ral:rated-lessons'

type LocalRatings = Record<string, string>

function readV2(): LocalRatings {
  try {
    const raw = localStorage.getItem(KEY_V2)
    if (!raw) return {}
    return JSON.parse(raw) as LocalRatings
  } catch {
    return {}
  }
}

function writeV2(data: LocalRatings): void {
  try {
    localStorage.setItem(KEY_V2, JSON.stringify(data))
  } catch {
    /* localStorage evtl. nicht verfügbar – dann eben kein Schutz */
  }
}

function readLegacySet(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY_LEGACY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

/** Wurde diese Stunde von diesem Gerät schon bewertet? */
export function hasRated(lessonKey: string): boolean {
  const v2 = readV2()
  if (lessonKey in v2) return true
  return readLegacySet().has(lessonKey)
}

/** Merkt sich, dass diese Stunde bewertet wurde (inkl. Rating-ID für spätere Bearbeitung). */
export function markRated(lessonKey: string, ratingId: string): void {
  const v2 = readV2()
  writeV2({ ...v2, [lessonKey]: ratingId })
}

/** Gibt die gespeicherte Rating-ID zurück – oder null für ältere Einträge ohne ID. */
export function getRatingId(lessonKey: string): string | null {
  const v2 = readV2()
  return v2[lessonKey] ?? null
}
