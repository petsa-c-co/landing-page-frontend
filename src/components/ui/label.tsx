import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "block font-heading text-sm uppercase tracking-wide text-navy-700 dark:text-navy-200 mb-1.5 select-none",
        className
      )}
      {...props}
    />
  )
}

export { Label }
