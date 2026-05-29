// Verhindert Doppel-Bewertungen pro Gerät via localStorage.

const KEY = 'ral:rated-lessons'

function readSet(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function writeSet(set: Set<string>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]))
  } catch {
    /* localStorage evtl. nicht verfügbar – dann eben kein Schutz */
  }
}

/** Wurde diese Stunde von diesem Gerät schon bewertet? */
export function hasRated(lessonKey: string): boolean {
  return readSet().has(lessonKey)
}

/** Merkt sich, dass diese Stunde bewertet wurde. */
export function markRated(lessonKey: string): void {
  const set = readSet()
  set.add(lessonKey)
  writeSet(set)
}
