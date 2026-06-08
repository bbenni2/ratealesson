// ════════════════════════════════════════════════════════════
//  KLASSEN
//  Hier stehen die wählbaren Klassen. Aktuell nur 7B – nächstes
//  Jahr einfach '8B' ergänzen. Bewertungen verschiedener Klassen
//  werden getrennt gespeichert (Spalte class_code in der DB).
// ════════════════════════════════════════════════════════════

export const CLASSES = ['7B'] as const

/** Vorausgewählte Klasse im Onboarding. */
export const DEFAULT_CLASS = '7B'

// ── Wahlfach-Vorschläge ─────────────────────────────────────
// Erscheinen als Chips im benutzerdefinierten Kurs-Editor.
// (Alles was in QUICK_SETUP_GROUPS steht, wird hier ausgeblendet.)
export const COURSE_SUGGESTIONS: { name: string; teacher?: string }[] = [
  { name: 'Italienisch', teacher: 'GS' },
  { name: 'Latein', teacher: 'FS' },
  { name: 'Spanisch', teacher: 'MK' },
  { name: 'Religion', teacher: 'DIR' },
  { name: 'Ethik', teacher: 'MS' },
  { name: 'Musik', teacher: 'MA' },
  { name: 'Zeichnen', teacher: 'WR' },
  { name: 'Sport', teacher: 'GR' },
  { name: 'Turnen', teacher: 'NP' },
]

// ── Quick-Setup Gruppen ──────────────────────────────────────
// Bekannte Teilungsgruppen mit fixen Slots – ermöglicht Setup mit
// wenigen Taps. Slots sind aus dem Untis-Plan der 7B abgeleitet.
// ⚠️  Stunden-Nummern bitte mit aktuellem Untis-Plan abgleichen!

export interface QuickSlot {
  weekday: 1 | 2 | 3 | 4 | 5
  period: number
  length: 1 | 2
}

export interface QuickOption {
  label: string
  /** undefined = „keine/nein"-Option – fügt keine Kurse hinzu. */
  name?: string
  teacher?: string
  slots?: QuickSlot[]
}

export interface QuickGroup {
  id: string
  icon: string
  question: string
  /** Letztes Element sollte immer die „keine"-Option sein. */
  options: QuickOption[]
}

export const QUICK_SETUP_GROUPS: QuickGroup[] = [
  {
    id: 'language',
    icon: '🌍',
    question: 'Welche Sprache hast du?',
    options: [
      {
        label: 'Italienisch',
        name: 'Italienisch',
        teacher: 'GS',
        // Ital hat mehr Stunden als Lat/Span (5/Woche)
        slots: [
          { weekday: 1, period: 3, length: 1 },
          { weekday: 1, period: 8, length: 1 },
          { weekday: 2, period: 5, length: 1 },
          { weekday: 3, period: 2, length: 1 },
          { weekday: 5, period: 2, length: 1 },
        ],
      },
      {
        label: 'Latein',
        name: 'Latein',
        teacher: 'FS',
        slots: [
          { weekday: 1, period: 3, length: 1 },
          { weekday: 3, period: 2, length: 1 },
          { weekday: 5, period: 2, length: 1 },
        ],
      },
      {
        label: 'Spanisch',
        name: 'Spanisch',
        teacher: 'MK',
        slots: [
          { weekday: 1, period: 3, length: 1 },
          { weekday: 3, period: 2, length: 1 },
          { weekday: 5, period: 2, length: 1 },
        ],
      },
      { label: 'keine' },
    ],
  },
  {
    id: 'religion',
    icon: '✝️',
    question: 'Religion oder Ethik?',
    options: [
      {
        label: 'Religion',
        name: 'Religion',
        teacher: 'DIR',
        slots: [
          { weekday: 1, period: 4, length: 1 },
          { weekday: 3, period: 5, length: 1 },
        ],
      },
      {
        label: 'Ethik',
        name: 'Ethik',
        teacher: 'MS',
        slots: [
          { weekday: 1, period: 4, length: 1 },
          { weekday: 3, period: 5, length: 1 },
        ],
      },
      { label: 'keines' },
    ],
  },
  {
    id: 'artmusic',
    icon: '🎨',
    question: 'Musik oder Zeichnen? (Fr 3./4.)',
    options: [
      {
        label: 'Musik',
        name: 'Musik',
        teacher: 'MA',
        slots: [{ weekday: 5, period: 3, length: 2 }],
      },
      {
        label: 'Zeichnen',
        name: 'Zeichnen',
        teacher: 'WR',
        slots: [{ weekday: 5, period: 3, length: 2 }],
      },
      { label: 'keines' },
    ],
  },
  {
    id: 'sport',
    icon: '⚽',
    question: 'Sport oder Turnen? (Mo 9./10. Doppel)',
    options: [
      {
        label: 'Sport · GR',
        name: 'Sport',
        teacher: 'GR',
        slots: [{ weekday: 1, period: 9, length: 2 }],
      },
      {
        label: 'Turnen · NP',
        name: 'Turnen',
        teacher: 'NP',
        slots: [{ weekday: 1, period: 9, length: 2 }],
      },
      { label: 'keines' },
    ],
  },
]

/** Alle Fach-Namen die von Quick-Gruppen verwaltet werden. */
export const QUICK_GROUP_NAMES = new Set(
  QUICK_SETUP_GROUPS.flatMap((g) => g.options.flatMap((o) => (o.name ? [o.name] : []))),
)

// ── Lehrkräfte (Kürzel → Vollständiger Name) ────────────────
// Quelle: https://www.werndlpark.at/index.php/schule/personen/lehrer-innen
// Stand: 2026. Bei Änderungen hier aktualisieren.

export const TEACHER_NAMES: Record<string, string> = {
  DIR: 'Florian Bachofner-Mayr',
  ADM: 'Markus Bachmayr',
  AM:  'Marlene Atschreiter',
  BA:  'Elisabeth Baldinger',
  BE:  'Eva Bauderer',
  BT:  'Thomas Beidl',
  BF:  'Gabriele Berndl-Forstner',
  BU:  'Erich Buchberger',
  DV:  'Valentina Derflinger',
  ES:  'Susanne Eggermann',
  EA:  'Antonella Enciu',
  FV:  'Vanessa Feichtner',
  FR:  'Roland Feldbaumer',
  FJ:  'Johanna Forster',
  FS:  'Sarah Füßlberger',
  GS:  'Simone Gergelyfi',
  GA:  'Armin Goldmann',
  GR:  'Reinhard Großalber',
  HA:  'Johannes Haas',
  HL:  'Lucia Haas',
  HS:  'Sejla Hadzic',
  HK:  'Katharina Hartl',
  HZ:  'Gerald Hatzmann',
  JA:  'Amar Jhala',
  KB:  'Barbara Kampenhuber',
  KK:  'Klaudia Kerbler',
  KC:  'Christine Kirchmayr',
  KN:  'Nina Kragl',
  KS:  'Elisabeth Klaus-Sternwieser',
  KP:  'Peter Krinninger',
  KR:  'Ralph Kritzinger',
  KE:  'Elisabeth Kutscher',
  LV:  'Veronika Lambertucci',
  LL:  'Lisa Langthaler',
  LS:  'Sabrina Leutgeweger',
  LJ:  'Julia Lichtenegger',
  LM:  'Martina Lindner',
  LC:  'Carina Loos',
  LB:  'Birgit Luger',
  MS:  'Sandra Markovsky',
  MF:  'Felix Marks',
  MK:  'Katharina Mitter',
  MA:  'Astrid Mitter-Aichinger',
  NP:  'Petra Neubauer-Sturm',
  NE:  'Evelyn Neudorfer',
  NF:  'Fabian Neuhuber',
  OS:  'Sonja Ortner',
  OE:  'Elisabeth Oswald',
  PA:  'Astrid Panzer',
  PM:  'Magdalena Pfaffeneder',
  PD:  'Doris Plattner',
  PV:  'Verena Pölzl',
  PK:  'Kurt Prack',
  PU:  'Michaela Puhr',
  PZ:  'Antoni Putz',
  RA:  'Elisabeth Radlgruber',
  RJ:  'Joachim Reimitz',
  RL:  'Lisa Robausch',
  RO:  'Oliver Rockenschaub',
  SC:  'Karin Schauer',
  SM:  'Martin Schindlauer',
  SN:  'Manuel Schmalnauer',
  SE:  'Stefanie Schned',
  SR:  'Christiane Schöndorfer',
  SH:  'Christina Schörkhuber',
  SF:  'Finn Schwaighofer',
  SD:  'Dieter Seher',
  'SÖ': 'Michelle Söser',
  ST:  'Mario Stroblmayr',
  SZ:  'Marlene Szigmund',
  TA:  'Albert Thür',
  WJ:  'Judith Weinberger-Riener',
  WM:  'Marco Wieser',
  WR:  'Manfred Wiesinger',
  WL:  'Lukas Winter',
}

/** Vollständiger Name einer Lehrkraft (Kürzel als Fallback). */
export function teacherName(abbr: string): string {
  return TEACHER_NAMES[abbr] ?? abbr
}
