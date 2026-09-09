import { cn } from "@/lib/utils"

interface AdminTabsProps<T extends string> {
  value: T
  onChange: (value: T) => void
  tabs: { value: T; label: string; count?: number }[]
  className?: string
}

// Pastillas para alternar vistas dentro de una pantalla del panel
// (por ejemplo, Listado / Papelera).
export const AdminTabs = <T extends string>({
  value,
  onChange,
  tabs,
  className,
}: AdminTabsProps<T>) => (
  <div className={cn("flex flex-wrap gap-2", className)}>
    {tabs.map((tab) => {
      const isActive = tab.value === value
      return (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          aria-pressed={isActive}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-heading uppercase tracking-wide transition-colors",
            isActive
              ? "bg-navy-600 text-white"
              : "bg-white dark:bg-navy-900 ring-1 ring-gray-200 dark:ring-navy-800 text-navy-700 dark:text-navy-200 hover:bg-gray-50 dark:hover:bg-navy-800/40",
          )}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span
              className={cn(
                "ml-2 rounded-full px-1.5 py-0.5 text-[10px]",
                isActive ? "bg-white/20" : "bg-gray-100 dark:bg-navy-800",
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      )
    })}
  </div>
)
