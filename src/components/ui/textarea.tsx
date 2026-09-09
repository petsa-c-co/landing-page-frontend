import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-32 w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-base outline-none transition-colors placeholder:text-gray-400",
        "dark:border-navy-700 dark:bg-navy-950 dark:text-navy-100 dark:placeholder:text-navy-400",
        "focus:border-sky-400 focus:ring-2 focus:ring-sky-400",
        "aria-invalid:border-red-400 aria-invalid:ring-red-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
