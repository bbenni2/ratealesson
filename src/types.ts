// ── Zentrale Typen ───────────────────────────────────────────

/** Wochentag-Index wie bei JS Date.getDay(): 0 = Sonntag … 6 = Samstag */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** Ein Eintrag im Stundenplan (Vorlage, noch ohne konkretes Datum). */
export interface TimetableEntry {
  /** Stundennummer 1..n – muss zu einer Period in periods.ts passen. */
  period: number
  /** Name des Fachs, z. B. "Mathematik". */
  subject: string
  /** Optional: Lehrkraft / Kürzel, z. B. "Mag. Huber". */
  teacher?: string
  /** Optional: Raum, z. B. "B204". */
  room?: string
  /** Optional: Emoji fürs Fach (rein kosmetisch). */
  emoji?: string
}

/** Eine Schulstunde mit konkreten Uhrzeiten (07:55 etc.). */
export interface Period {
  period: number
  /** Startzeit "HH:mm" */
  start: string
  /** Endzeit "HH:mm" */
  end: string
}

/** Eine konkrete Stunde an einem konkreten Tag (aufgelöst aus Plan + Datum). */
export interface LessonInstance {
  /** Datum im Format yyyy-MM-dd */
  date: string
  /** Stunde, an der die Einheit beginnt (bei Doppelstunden die erste). */
  period: number
  /** Anzahl der belegten Stunden (1 = Einzel, 2 = Doppelstunde). */
  length: number
  subject: string
  teacher?: string
  room?: string
  emoji?: string
  /**
   * Stabiler Code des Kurses/der Gruppe – trennt parallele Kurse
   * (z. B. Latein vs. Spanisch in derselben Stunde) bei den Bewertungen.
   * `null` = gemeinsame Stunde der ganzen Klasse.
   */
  courseCode: string | null
  /** True, wenn diese Einheit ein selbst hinzugefügter Kurs ist. */
  isCourse: boolean
  /** Vollständiger Startzeitpunkt */
  startsAt: Date
  /** Vollständiger Endzeitpunkt */
  endsAt: Date
}

/** Ein selbst angelegter Kurs (Sprache, Wahlpflicht, …) im localStorage. */
export interface StudentCourse {
  /** lokale ID */
  id: string
  /** Anzeigename, z. B. "Italienisch (GS)" */
  name: string
  teacher?: string
  /** Wochentag 1=Mo … 5=Fr */
  weekday: Weekday
  /** Startstunde (1..n) */
  period: number
  /** Länge in Stunden: 1 oder 2 (Doppelstunde). */
  length: 1 | 2
}

/** Persönliche Konfiguration eines Geräts (anonym, nur lokal). */
export interface StudentConfig {
  /** Gewählte Klasse, z. B. "7B". */
  className: string
  /** Selbst hinzugefügte Kurse. */
  courses: StudentCourse[]
  /** Onboarding abgeschlossen? */
  onboarded: boolean
}

/** Eine Bewertung, wie sie in der DB liegt. */
export interface Rating {
  id: string
  created_at: string
  class_code: string
  lesson_date: string
  period: number
  subject: string
  /** Kurs-/Gruppen-Code; null bei gemeinsamen Stunden. */
  course_code: string | null
  /** 1.0–5.0 in 0,5-Schritten. */
  stars: number
  comment: string | null
  nickname: string | null
}

/** Eingabe beim Erstellen einer neuen Bewertung. */
export interface NewRating {
  class_code: string
  lesson_date: string
  period: number
  subject: string
  course_code?: string | null
  stars: number
  comment?: string | null
  nickname?: string | null
}

/** Aggregierte Statistik (z. B. pro Fach oder pro Stunde). */
export interface RatingSummary {
  count: number
  average: number
}
