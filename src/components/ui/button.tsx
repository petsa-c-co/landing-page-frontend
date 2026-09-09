import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-heading uppercase tracking-wide text-sm transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
  {
    variants: {
      variant: {
        default: "bg-sky-500 text-white hover:bg-sky-600",
        navy: "bg-navy-600 text-white hover:bg-navy-700",
        // Las variantes de contorno y fantasma pintaban el texto en navy-600 /
        // navy-700 sin alternativa oscura, y sobre el navy-900 del panel eso
        // se lee como un botón deshabilitado. Los tonos oscuros espejan los
        // que ya usa ConfirmDialog a mano, para que todos los botones de
        // contorno del panel se vean igual.
        outline:
          "border border-navy-600 dark:border-navy-700 text-navy-600 dark:text-navy-200 hover:bg-navy-600 hover:text-white dark:hover:bg-navy-800 dark:hover:text-white",
        "outline-light":
          "border border-white/60 text-white hover:bg-white/10",
        ghost:
          "text-navy-700 dark:text-navy-200 hover:text-sky-500 dark:hover:text-sky-400",
        link: "text-sky-500 underline-offset-4 hover:underline normal-case",
      },
      size: {
        default: "px-6 py-3",
        sm: "px-4 py-2 text-xs",
        lg: "px-8 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
