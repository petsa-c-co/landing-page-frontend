import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded px-2.5 py-0.5 text-[11px] font-heading uppercase tracking-wide",
  {
    variants: {
      variant: {
        sky: "bg-sky-50 text-sky-600",
        amber: "bg-amber-50 text-amber-600",
        navy: "bg-navy-50 text-navy-700",
        // Para estados: verde "está andando", gris "ya no".
        green: "bg-green-50 text-green-700",
        muted: "bg-gray-100 text-gray-500",
        outline: "ring-1 ring-white/30 bg-white/10 text-white rounded-full",
      },
    },
    defaultVariants: {
      variant: "sky",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
