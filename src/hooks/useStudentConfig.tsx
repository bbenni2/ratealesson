import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_CLASS } from '../config/classes'
import type { StudentConfig, StudentCourse } from '../types'

const KEY = 'ral:student-config'

const EMPTY: StudentConfig = {
  className: DEFAULT_CLASS,
  courses: [],
  onboarded: false,
}

function read(): StudentConfig {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<StudentConfig>
    return {
      className: parsed.className ?? DEFAULT_CLASS,
      courses: Array.isArray(parsed.courses) ? (parsed.courses as StudentCourse[]) : [],
      onboarded: Boolean(parsed.onboarded),
    }
  } catch {
    return EMPTY
  }
}

interface ConfigContextValue {
  config: StudentConfig
  setClassName: (className: string) => void
  addCourse: (course: Omit<StudentCourse, 'id'>) => void
  removeCourse: (id: string) => void
  completeOnboarding: () => void
  /** Setzt alles zurück (z. B. „neu einrichten"). */
  reset: () => void
}

const ConfigContext = createContext<ConfigContextValue | null>(null)

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function StudentConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<StudentConfig>(() => read())

  // Persistieren bei jeder Änderung.
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(config))
    } catch {
      /* localStorage evtl. gesperrt */
    }
  }, [config])

  const setClassName = useCallback((className: string) => {
    setConfig((c) => ({ ...c, className }))
  }, [])

  const addCourse = useCallback((course: Omit<StudentCourse, 'id'>) => {
    setConfig((c) => ({ ...c, courses: [...c.courses, { ...course, id: uid() }] }))
  }, [])

  const removeCourse = useCallback((id: string) => {
    setConfig((c) => ({ ...c, courses: c.courses.filter((x) => x.id !== id) }))
  }, [])

  const completeOnboarding = useCallback(() => {
    setConfig((c) => ({ ...c, onboarded: true }))
  }, [])

  const reset = useCallback(() => setConfig({ ...EMPTY }), [])

  const value = useMemo<ConfigContextValue>(
    () => ({ config, setClassName, addCourse, removeCourse, completeOnboarding, reset }),
    [config, setClassName, addCourse, removeCourse, completeOnboarding, reset],
  )

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
}

export function useStudentConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useStudentConfig muss in <StudentConfigProvider> stehen')
  return ctx
}
