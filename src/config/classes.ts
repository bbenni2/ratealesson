// ════════════════════════════════════════════════════════════
//  KLASSEN
//  Hier stehen die wählbaren Klassen. Aktuell nur 7B – nächstes
//  Jahr einfach '8B' ergänzen. Bewertungen verschiedener Klassen
//  werden getrennt gespeichert (Spalte class_code in der DB).
// ════════════════════════════════════════════════════════════

export const CLASSES = ['7B'] as const

/** Vorausgewählte Klasse im Onboarding. */
export const DEFAULT_CLASS = '7B'

// ── Vorschläge für Kurs-Namen ────────────────────────────────
// Erscheinen als Auto-Vervollständigung, wenn jemand einen Kurs
// hinzufügt. So tippen alle denselben Namen → konsistente Ratings.
// Beliebig erweiterbar.
export const COURSE_SUGGESTIONS: { name: string; teacher?: string }[] = [
  { name: 'Italienisch', teacher: 'GS' },
  { name: 'Latein', teacher: 'FS' },
  { name: 'Spanisch', teacher: 'MK' },
  { name: 'Religion', teacher: 'DIR' },
  { name: 'Ethik', teacher: 'MS' },
]
