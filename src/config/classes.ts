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
// Erscheinen als Chips im Wahlfach-Editor. Lehrer-Kürzel fixiert
// → alle tragen denselben Namen → konsistente Ratings.
export const COURSE_SUGGESTIONS: { name: string; teacher?: string }[] = [
  // Sprachen
  { name: 'Italienisch', teacher: 'GS' },
  { name: 'Latein', teacher: 'FS' },
  { name: 'Spanisch', teacher: 'MK' },
  // Religion / Ethik
  { name: 'Religion', teacher: 'DIR' },
  { name: 'Ethik', teacher: 'MS' },
  // Freitag-Gruppen: entweder Musik ODER Zeichnen (getrennte Klassen-Hälften)
  { name: 'Musik', teacher: 'MA' },
  { name: 'Zeichnen', teacher: 'WR' },
  // Sport (Montag 9. Stunde, nach der Sprachstunde)
  { name: 'Sport' },
]

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
