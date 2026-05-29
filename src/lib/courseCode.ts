/**
 * Erzeugt aus einem Kurs-Namen (+ optional Lehrkraft) einen stabilen,
 * normalisierten Code. So landen Bewertungen aller, die denselben Kurs
 * eingetragen haben, im selben Topf – egal mit welcher Groß-/Kleinschreibung.
 *
 * "Italienisch" + "GS"  ->  "italienisch-gs"
 */
export function courseCodeFrom(name: string, teacher?: string): string {
  const base = `${name} ${teacher ?? ''}`
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Akzente entfernen
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base.slice(0, 40) || 'kurs'
}
