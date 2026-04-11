const NAV_ITEMS = [
  { icon: 'database', label: 'CHAMBER', active: true },
  { icon: 'science',  label: 'MUTATE',  active: false },
  { icon: 'token',    label: 'MARKET',  active: false },
  { icon: 'settings', label: 'SYSTEM',  active: false },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full h-16 flex justify-around items-stretch bg-surface-container-lowest z-50">
      {NAV_ITEMS.map(({ icon, label, active }) => (
        <button
          key={label}
          className={`flex flex-col items-center justify-center h-full w-full transition-colors ${
            active
              ? 'bg-primary-container text-on-primary-container'
              : 'text-outline-variant cursor-not-allowed'
          }`}
          disabled={!active}
        >
          <span
            className="material-symbols-outlined text-xl"
            style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            {icon}
          </span>
          <span className="font-label text-[10px] tracking-tighter uppercase mt-0.5">{label}</span>
        </button>
      ))}
    </nav>
  )
}
