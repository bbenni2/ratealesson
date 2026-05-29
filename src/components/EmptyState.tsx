import type { ReactNode } from 'react'

interface Props {
  emoji: string
  title: string
  hint?: string
  children?: ReactNode
}

export function EmptyState({ emoji, title, hint, children }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line px-6 py-12 text-center animate-fade-in">
      <div className="text-5xl">{emoji}</div>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      {hint && <p className="max-w-xs text-sm text-white/50">{hint}</p>}
      {children}
    </div>
  )
}
