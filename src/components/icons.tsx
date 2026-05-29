import type { SVGProps } from 'react'

export function StarIcon({
  filled = false,
  ...props
}: SVGProps<SVGSVGElement> & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.32 6.2 20.36l1.11-6.46-4.7-4.58 6.49-.94L12 2.5z" />
    </svg>
  )
}

export function LiveIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M6.3 6.3a8 8 0 000 11.4M17.7 6.3a8 8 0 010 11.4M3.5 3.5a12 12 0 000 17M20.5 3.5a12 12 0 010 17" strokeLinecap="round" />
    </svg>
  )
}

export function TrophyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 4h12v3a6 6 0 01-12 0V4z" />
      <path d="M6 5H3.5v1A3.5 3.5 0 006 9.4M18 5h2.5v1A3.5 3.5 0 0118 9.4" />
      <path d="M12 13v3M9 20h6M10 20l.5-4h3l.5 4" />
    </svg>
  )
}

export function HistoryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 109-9 9 9 0 00-7.5 4M3 4v3.5h3.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  )
}
