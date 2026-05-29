import { NavLink } from 'react-router-dom'
import { HistoryIcon, LiveIcon, TrophyIcon } from './icons'

const TABS = [
  { to: '/', label: 'Live', Icon: LiveIcon, end: true },
  { to: '/stats', label: 'Stats', Icon: TrophyIcon, end: false },
  { to: '/verlauf', label: 'Verlauf', Icon: HistoryIcon, end: false },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-bg-soft/90 backdrop-blur-xl pb-safe">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {TABS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition ${
                isActive ? 'text-accent-soft' : 'text-white/40 hover:text-white/70'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute -top-px h-0.5 w-8 rounded-full bg-gradient-to-r from-accent to-accent-glow shadow-glow" />
                )}
                <Icon width={22} height={22} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
