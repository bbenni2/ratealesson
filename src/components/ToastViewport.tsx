import { useToast } from '../hooks/useToast'
import { CheckIcon, CloseIcon } from './icons'

const STYLE: Record<string, string> = {
  success: 'border-lime/40 bg-lime/10 text-lime',
  error: 'border-red-500/40 bg-red-500/10 text-red-300',
  info: 'border-accent/40 bg-accent/10 text-accent-soft',
}

export function ToastViewport() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4 pt-3 pt-safe">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md animate-toast-in ${STYLE[t.kind]}`}
        >
          <span className="shrink-0">
            {t.kind === 'success' ? (
              <CheckIcon width={16} height={16} />
            ) : t.kind === 'error' ? (
              <CloseIcon width={16} height={16} />
            ) : (
              '✦'
            )}
          </span>
          <span className="flex-1 text-white/90">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
