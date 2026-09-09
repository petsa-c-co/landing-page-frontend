import { cn } from "@/lib/utils"

interface AccentBarProps {
  className?: string
  // "sky" (por defecto) para las secciones de fondo claro del sitio; "navy"
  // para el banner de marca, donde el celeste queda desvaído y el azul del
  // logo cierra mejor.
  tone?: "sky" | "navy"
}

// Barra de acento azul→rojo (los dos colores del logo). Va debajo de los
// títulos de sección. Para centrarla, pasar `mx-auto` en className.
export const AccentBar = ({ className, tone = "sky" }: AccentBarProps) => (
  <span
    aria-hidden="true"
    className={cn(
      "block h-1 w-16 rounded-full bg-gradient-to-r to-petrogas-red-500",
      tone === "navy" ? "from-navy-700" : "from-sky-500",
      className,
    )}
  />
)
