import type { ComponentProps } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Select con la flecha propia (appearance-none oculta la nativa, que queda
// pegada al borde y no respeta el diseño). El chevron va con espaciado y se
// adapta al modo oscuro.
export const AdminSelect = ({
  className,
  children,
  ...props
}: ComponentProps<"select">) => (
  <div className="relative">
    <select
      className={cn(
        "w-full appearance-none rounded-lg border border-gray-300 dark:border-navy-700 dark:bg-navy-950 dark:text-navy-100 pl-4 pr-10 py-2.5 text-base outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-400",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  </div>
)
