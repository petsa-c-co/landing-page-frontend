import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CTASectionProps {
  title: string
  description: string
  buttonLabel: string
  to?: string
  href?: string
  className?: string
}

export const CTASection = ({
  title,
  description,
  buttonLabel,
  to,
  href,
  className,
}: CTASectionProps) => {
  return (
    <section className={cn("py-14 bg-navy-900", className)}>
      <div className="max-w-7xl page-container flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <h2 className="font-heading uppercase font-semibold text-white text-[1.75rem] md:text-[2.125rem] mb-2">
            {title}
          </h2>
          <p className="text-navy-300">{description}</p>
        </div>
        {to ? (
          <Button asChild className="shrink-0">
            <Link to={to}>{buttonLabel}</Link>
          </Button>
        ) : (
          <Button asChild className="shrink-0">
            <a href={href} target="_blank" rel="noopener">
              {buttonLabel}
            </a>
          </Button>
        )}
      </div>
    </section>
  )
}
