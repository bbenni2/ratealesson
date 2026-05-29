import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  kind: ToastKind
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (message: string, kind?: ToastKind) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let counter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = ++counter
      setToasts((prev) => [...prev, { id, message, kind }])
      setTimeout(() => dismiss(id), 3600)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast muss innerhalb von <ToastProvider> stehen')
  return ctx
}
