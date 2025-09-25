type TabId = "map" | "profile" | "shop" | "graph"

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}


export default function MockBottomNavbar({
  activeTab = "map",
  onTabPress,
}: {
  activeTab?: TabId
  onTabPress?: (tab: TabId) => void
}) {
  const tabs = [
    { id: "map", label: "מפה", icon: MapIcon },
    { id: "graph", label: "גרף", icon: GraphIcon },
    { id: "shop", label: "חנות", icon: ShopIcon },
    { id: "profile", label: "פרופיל", icon: ProfileIcon },
  ] as const

  return (
    <div className="flex w-full bg-white border-t border-slate-200 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] pt-3 pb-5">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => onTabPress?.(tab.id)}
            className="flex flex-1 flex-col items-center justify-center py-2 text-xs focus:outline-none"
          >
            <Icon
              className={cn(
                "w-6 h-6 mb-1",
                isActive ? "text-blue-600" : "text-slate-600"
              )}
            />
            <span
              className={cn(
                isActive ? "text-blue-600 font-semibold" : "text-slate-600"
              )}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ====== Icons (Tailwind-compatible with stroke) ======

function MapIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="11" />
      <path d="M12 7v10M17 11v6M7 13v4" />
    </svg>
  )
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="7" r="5" />
      <path d="M4 21v-1a4 4 0 014-4h8a4 4 0 014 4v1" />
    </svg>
  )
}

function ShopIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}

function GraphIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 3v18h18" />
      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
    </svg>
  )
}
